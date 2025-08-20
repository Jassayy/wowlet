import axios from "axios";
import { NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";
import { formatEther } from "ethers";

type Network = "ETHEREUM" | "SOLANA";

type PortfolioToken = {
     symbol: string;
     amount: number;
     usd: number;
     address?: string; // ERC20 contract
     mint?: string; // SPL mint
};

type PortfolioResponse = {
     native: { symbol: string; amount: number; usd: number };
     tokens: PortfolioToken[];
     totals: { usd: number };
};

async function fetchCoinGeckoNativeUsd(network: Network): Promise<number> {
     const ids = network === "ETHEREUM" ? "ethereum" : "solana";
     const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`;
     const res = await axios.get(url);
     return res.data[ids]?.usd ?? 0;
}

async function fetchCoinGeckoTokenPrices(
     network: Network,
     addresses: string[]
): Promise<Record<string, number>> {
     if (addresses.length === 0) return {};
     const platform = network === "ETHEREUM" ? "ethereum" : "solana";
     // Coingecko contract addresses must be comma-separated
     const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${addresses.join(
          ","
     )}&vs_currencies=usd`;
     const res = await axios.get(url);
     const out: Record<string, number> = {};
     for (const [addr, payload] of Object.entries(res.data || {})) {
          out[addr.toLowerCase()] = (payload as any)?.usd ?? 0;
     }
     return out;
}

async function fetchEthereumNativeAndTokens(address: string) {
     const etherscanKey = process.env.ETHERSCAN_API_KEY;
     if (!etherscanKey) {
          throw new Error("Missing ETHERSCAN_API_KEY env");
     }

     // Native ETH balance via Etherscan
     const balanceUrl = `https://api.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest&apikey=${etherscanKey}`;
     const balanceRes = await axios.get(balanceUrl);
     const wei = balanceRes.data?.result ?? "0";
     const eth = parseFloat(formatEther(BigInt(wei)));

     // ERC20 balances. Prefer Covalent if key present, else Moralis
     const covalentKey = process.env.COVALENT_API_KEY;
     const moralisKey = process.env.MORALIS_API_KEY;

     let tokens: Array<{
          symbol: string;
          amount: number;
          address: string;
          decimals: number;
     }> = [];

     if (covalentKey) {
          const covalentUrl = `https://api.covalenthq.com/v1/eth-mainnet/address/${address}/balances_v2/?key=${covalentKey}`;
          const r = await axios.get(covalentUrl);
          const items = r.data?.data?.items || [];
          tokens = items
               .filter(
                    (it: any) =>
                         it.type === "cryptocurrency" ||
                         it.type === "stablecoin" ||
                         it.contract_decimals > 0
               )
               .filter((it: any) => Number(it.balance) > 0)
               .map((it: any) => ({
                    symbol: it.contract_ticker_symbol,
                    amount:
                         Number(it.balance) /
                         Math.pow(10, it.contract_decimals),
                    address: (it.contract_address as string).toLowerCase(),
                    decimals: it.contract_decimals,
               }));
     } else if (moralisKey) {
          const url = `https://deep-index.moralis.io/api/v2/${address}/erc20?chain=eth`;
          const r = await axios.get(url, {
               headers: { "X-API-Key": moralisKey },
          });
          const items = r.data || [];
          tokens = items
               .filter((it: any) => Number(it.balance) > 0)
               .map((it: any) => ({
                    symbol: it.symbol,
                    amount: Number(it.balance) / Math.pow(10, it.decimals),
                    address: (it.token_address as string).toLowerCase(),
                    decimals: it.decimals,
               }));
     } else {
          // Fallback: no third-party token balance provider configured
          tokens = [];
     }

     return { eth, tokens };
}

async function fetchSolanaNativeAndTokens(address: string) {
     const rpcUrl =
          process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
     const connection = new Connection(rpcUrl, "confirmed");
     const pubkey = new PublicKey(address);

     const lamports = await connection.getBalance(pubkey);
     const sol = lamports / 1e9;

     const tokenResp = await connection.getParsedTokenAccountsByOwner(pubkey, {
          programId: new PublicKey(
               "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
          ),
     });

     const tokens = tokenResp.value
          .map((acc) => acc.account.data.parsed.info)
          .filter(
               (info: any) =>
                    info.tokenAmount?.uiAmount && info.tokenAmount.uiAmount > 0
          )
          .map((info: any) => ({
               symbol: info.mint, // true symbol requires metadata registry; we'll show mint as fallback
               amount: Number(info.tokenAmount.uiAmount),
               mint: (info.mint as string).toLowerCase(),
               decimals: info.tokenAmount.decimals,
          }));

     return { sol, tokens };
}

export async function POST(req: Request) {
     try {
          const { address, network } = (await req.json()) as {
               address: string;
               network: Network;
          };

          if (!address || !network) {
               return NextResponse.json(
                    { error: "address and network are required" },
                    { status: 400 }
               );
          }

          if (network !== "ETHEREUM" && network !== "SOLANA") {
               return NextResponse.json(
                    { error: "Unsupported network" },
                    { status: 400 }
               );
          }

          let nativeAmount = 0;
          let nativeSymbol = network === "ETHEREUM" ? "ETH" : "SOL";
          let tokens: PortfolioToken[] = [];

          if (network === "ETHEREUM") {
               const { eth, tokens: erc20 } =
                    await fetchEthereumNativeAndTokens(address);
               nativeAmount = eth;
               const addrs = erc20.map((t) => t.address);
               const prices = await fetchCoinGeckoTokenPrices(
                    "ETHEREUM",
                    addrs
               );
               tokens = erc20.map((t) => ({
                    symbol: t.symbol || t.address?.slice(0, 6) || "TOKEN",
                    amount: t.amount,
                    usd: t.amount * (prices[t.address] ?? 0),
                    address: t.address,
               }));
          } else {
               const { sol, tokens: spl } = await fetchSolanaNativeAndTokens(
                    address
               );
               nativeAmount = sol;
               const mints = spl.map((t: any) => t.mint as string);
               const prices = await fetchCoinGeckoTokenPrices("SOLANA", mints);
               tokens = spl.map((t: any) => ({
                    symbol: t.symbol || (t.mint as string).slice(0, 6),
                    amount: t.amount,
                    usd:
                         t.amount *
                         (prices[(t.mint as string).toLowerCase()] ?? 0),
                    mint: t.mint as string,
               }));
          }

          const nativeUsdPrice = await fetchCoinGeckoNativeUsd(network);
          const native = {
               symbol: nativeSymbol,
               amount: nativeAmount,
               usd: nativeAmount * nativeUsdPrice,
          };

          const totalUsd =
               native.usd + tokens.reduce((sum, t) => sum + (t.usd || 0), 0);

          const payload: PortfolioResponse = {
               native,
               tokens,
               totals: { usd: totalUsd },
          };

          return NextResponse.json(payload);
     } catch (error) {
          console.error("/api/portfolio error", error);
          return NextResponse.json({ error: "Server error" }, { status: 500 });
     }
}
