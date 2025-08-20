import axios from "axios";
import { NextResponse } from "next/server";
import { formatEther } from "ethers";
import { prisma } from "@/lib/prisma";
import { Connection, PublicKey } from "@solana/web3.js";


async function getERC20Balances(address: string) {
     const apiKey = process.env.ETHERSCAN_API_KEY;

     const url = `https://api.etherscan.io/api?module=account&action=tokentx&address=${address}&page=1&offset=100&sort=desc&apikey=${apiKey}`;

     const response = await axios.get(url);
     const data = response.data.result;

     const balances: Record<string, { symbol: string; balance: number }> = {};

     for (const tx of data) {
          const token = tx.tokenSymbol;
          const decimals = tx.tokenDecimal;
          const value = Number(tx.value) / Math.pow(10, decimals);

          if (!balances[token]) {
               balances[token] = { symbol: token, balance: 0 };
          }

          // Incoming/outgoing tx
          if (tx.to.toLowerCase() === address.toLowerCase()) {
               balances[token].balance += value;
          } else if (tx.from.toLowerCase() === address.toLowerCase()) {
               balances[token].balance -= value;
          }
     }

     return Object.values(balances);
}

// Helper to fetch Solana SPL tokens
async function getSPLTokens(address: string) {
     const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
     const connection = new Connection(rpcUrl, "confirmed");
     const publicKey = new PublicKey(address);

     const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
          programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
     });

     return tokenAccounts.value.map((account) => {
          const info = account.account.data.parsed.info;
          return {
               mint: info.mint,
               amount: info.tokenAmount.uiAmount,
               decimals: info.tokenAmount.decimals,
          };
     });
}


export async function POST(req: Request) {
     const { address, type } = await req.json();

     if (!address)
          return NextResponse.json(
               { error: "Wallet address required." },
               { status: 400 }
          );

     try {
          let balance: number;
          let tokenSymbol: string;

          if (type === "ETHEREUM") {
               //Ethereum balance using etherscan
               const apiKey = process.env.ETHERSCAN_API_KEY;

               if (!apiKey)
                    return NextResponse.json(
                         { error: "Etherscan api key is required" },
                         { status: 400 }
                    );

               const url = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${apiKey}`;

               const response = await axios.get(url);

               const data = response.data;

               if (data.status !== "1") {
                    return NextResponse.json(
                         { error: "Failed to fetch balance of wallet" },
                         { status: 500 }
                    );
               }

               const balanceInWei = data.result;
               //format balance
               balance = parseFloat(formatEther(BigInt(balanceInWei)));
               tokenSymbol = "ETH";
          } else if (type === "SOLANA") {
               const rpcUrl =
                    process.env.SOLANA_RPC_URL ||
                    "https://api.mainnet-beta.solana.com";

               const connection = new Connection(rpcUrl);

               const publicKey = new PublicKey(address);

               const lamports = await connection.getBalance(publicKey); //will return lamports

               balance = lamports / 1e9; //converts lamports -> sol
               tokenSymbol = "SOL";
          } else {
               return NextResponse.json(
                    {
                         error: "Unsupported wallet type",
                    },
                    {
                         status: 400,
                    }
               );
          }

          if (type === "ERC20") {
               const balances = await getERC20Balances(address);
               return NextResponse.json({ success: true, balances });
          }

          if (type === "SPL") {
               const balances = await getSPLTokens(address);
               return NextResponse.json({ success: true, balances });
          }

          //find wallet in db
          const wallet = await prisma.wallet.findUnique({
               where: {
                    address,
               },
          });

          if (!wallet) {
               return NextResponse.json(
                    { error: "Wallet not found in database" },
                    { status: 404 }
               );
          }

          //save balance in db
          const savedBalance = await prisma.balance.create({
               data: {
                    walletId: wallet.id,
                    tokenSymbol,
                    amount: balance,
               },
          });

          return NextResponse.json({
               success: true,
               balance: savedBalance,
          });
     } catch (error) {
          console.error("Server error : (balance/route.ts) : -> ", error);
          return NextResponse.json(
               { error: "Server error (balance/route.ts)" },
               {
                    status: 500,
               }
          );
     }
}
