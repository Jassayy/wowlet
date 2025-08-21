"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { WalletType } from "@prisma/client";
import { Button } from "../ui/button";
import toast from "react-hot-toast";

const ConnectEthereum = () => {
     const [account, setAccount] = useState<string | null>(null);
     const [balance, setBalance] = useState<string | null>(null);
     const [error, setError] = useState<string | null>(null);
     const [loading, setLoading] = useState(false);

     useEffect(() => {
          const stored = localStorage.getItem("connected_eth_address");
          if (stored) {
               setAccount(stored);
               void fetchBalance(stored);
          }
     }, []);

     const connectWallet = async () => {
          if (!window.ethereum) {
               toast.error("MetaMask not found! Please install it first 🦊");
               return;
          }

          try {
               const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
               });

               const address = accounts[0];
               setAccount(address);
               localStorage.setItem("connected_eth_address", address);

               toast.success("Ethereum wallet connected! 🎉");

               try {
                    await axios.post("/api/wallets", {
                         address,
                         type: WalletType.ETHEREUM,
                    });
                    console.log("Wallet connected successfully.");
               } catch (err: any) {
                    if (err?.response?.status !== 401) {
                         console.error("Error connecting wallet: ", err);
                    }
               }
               await fetchBalance(address);
          } catch (error) {
               toast.error("Failed to connect wallet");
               console.error("Wallet connection error:", error);
          }
     };

     const disconnectWallet = async () => {
          if (!account) return;

          try {
               await axios.post("/api/wallets/disconnect", {
                    address: account,
               });
               toast.success("Wallet disconnected successfully! 👋");
          } catch (err) {
               console.error("Error disconnecting wallet");
          }

          setAccount(null);
          setBalance(null);
          localStorage.removeItem("connected_eth_address");
     };

     const fetchBalance = async (addr?: string) => {
          const address = addr || account;
          if (!address) return;

          setLoading(true);
          setError(null);
          try {
               const res = await axios.post("/api/balance", {
                    address,
                    type: "ETHEREUM",
               });
               setBalance(res.data.balance.amount.toFixed(4));
               toast.success("Balance updated! 💰");
          } catch (err: any) {
               console.error("Error fetching Ethereum Balance : ", err);
               const errorMsg = "Failed to fetch ETH balance";
               setError(errorMsg);
               toast.error(errorMsg);
          } finally {
               setLoading(false);
          }
     };

     return (
          <div className="space-y-6">
               <div className="flex flex-col gap-4">
                    {!account ? (
                         <Button
                              onClick={connectWallet}
                              className="bg-[#FF6B6B] hover:bg-[#FF8787] 
            text-white font-extrabold px-6 py-4 rounded-2xl border-4 border-black text-lg
            shadow-[6px_6px_0px_#000] transition-transform active:translate-x-[3px] active:translate-y-[3px]
            active:shadow-[3px_3px_0px_#000] cursor-pointer"
                         >
                              🦊 Connect MetaMask
                         </Button>
                    ) : (
                         <div className="flex flex-col gap-4">
                              <Button
                                   onClick={disconnectWallet}
                                   className="bg-[#FFD93D] hover:bg-[#FFE066] 
              text-black font-extrabold px-6 py-3 rounded-2xl border-4 border-black text-lg
              shadow-[5px_5px_0px_#000] transition-transform active:translate-x-[2px] active:translate-y-[2px]
              active:shadow-[2px_2px_0px_#000] cursor-pointer"
                              >
                                   🔌 Disconnect Wallet
                              </Button>
                              <Button
                                   onClick={() => fetchBalance()}
                                   disabled={loading}
                                   className="bg-[#4ECDC4] hover:bg-[#6EE7E0] 
              text-black font-extrabold px-6 py-3 rounded-2xl border-4 border-black text-lg
              shadow-[5px_5px_0px_#000] transition-transform active:translate-x-[2px] active:translate-y-[2px]
              active:shadow-[2px_2px_0px_#000] cursor-pointer disabled:opacity-70"
                              >
                                   {loading
                                        ? "🔄 Loading..."
                                        : "🔃 Refresh Balance"}
                              </Button>
                         </div>
                    )}
               </div>

               {account && (
                    <div
                         className="bg-[#A29BFE] p-6 rounded-2xl border-4 border-black 
          shadow-[6px_6px_0px_#000] text-center space-y-3"
                    >
                         <div className="text-xl font-extrabold text-[#2B2D42]">
                              🔗 Connected
                         </div>
                         <div className="text-sm font-semibold text-black break-all bg-white px-2 py-1 rounded-lg border-2 border-black shadow-sm">
                              {account}
                         </div>
                         <div className="text-2xl font-black text-[#2ECC71] drop-shadow-[2px_2px_0_#000]">
                              {loading
                                   ? "⏳ Fetching..."
                                   : balance
                                   ? `💰 ${balance} ETH`
                                   : "—"}
                         </div>
                    </div>
               )}

               {error && (
                    <div
                         className="bg-[#FF6B6B] border-4 border-black text-black p-4 rounded-2xl font-bold 
          text-center shadow-[4px_4px_0px_#000]"
                    >
                         ⚠️ {error}
                    </div>
               )}
          </div>
     );
};

export default ConnectEthereum;
