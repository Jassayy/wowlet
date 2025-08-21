"use client";

import { WalletType } from "@prisma/client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import toast from "react-hot-toast";

const ConnectPhantom = () => {
     const [account, setAccount] = useState<string | null>(null);
     const [balance, setBalance] = useState<string | null>(null);
     const [loading, setLoading] = useState(false);
     const [error, setError] = useState<string | null>(null);

     useEffect(() => {
          const stored = localStorage.getItem("connected_sol_address");
          if (stored) {
               setAccount(stored);
               void fetchBalance(stored);
          }
     }, []);

     const connectWallet = async () => {
          const provider = (window as any).solana;
          if (!provider?.isPhantom) {
               toast.error("Phantom Wallet not found! Please install it first 👻");
               return;
          }

          try {
               const resp = await provider.connect();
               const address = resp.publicKey.toString();
               setAccount(address);
               localStorage.setItem("connected_sol_address", address);

               toast.success("Phantom wallet connected! 🎉");

               try {
                    await axios.post("/api/wallets", {
                         address,
                         type: WalletType.SOLANA,
                    });
                    console.log("Wallet Connected successfully.");
               } catch (err: any) {
                    if (err?.response?.status !== 401) {
                         console.error("Error connecting your phantom wallet. : ", err);
                    }
               }
               await fetchBalance(address);
          } catch (error) {
               toast.error("Failed to connect Phantom wallet");
               console.error("Phantom connection error:", error);
          }
     };

     const disconnectWallet = async () => {
          if (!account) return;

          try {
               await axios.post("/api/wallets/disconnect", {
                    address: account,
               });
               toast.success("Wallet disconnected successfully! 👋");
          } catch (error) {
               console.error("Error disconnecting wallet. : ", error);
          }

          setAccount(null);
          setBalance(null);
          localStorage.removeItem("connected_sol_address");
     };

     const fetchBalance = async (addr?: String) => {
          const address = addr || account;
          if (!address) return;

          setLoading(true);
          setError(null);
          try {
               const res = await axios.post("/api/balance", {
                    address,
                    type: "SOLANA",
               });
               setBalance(res.data.balance.amount.toFixed(4));
               toast.success("Balance updated! 💰");
          } catch (err: any) {
               console.error("Error fetching Solana Balance : ", err);
               const errorMsg = "Failed to fetch SOL balance";
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
                              className="bg-purple-400 hover:bg-purple-300 text-black font-extrabold 
                              px-6 py-4 rounded-2xl border-4 border-black text-lg
                              shadow-[6px_6px_0px_rgba(0,0,0,0.9)]
                              transition-transform active:translate-x-[3px] active:translate-y-[3px]
                              active:shadow-[3px_3px_0px_rgba(0,0,0,0.9)] cursor-pointer"
                         >
                              👻 Connect Phantom
                         </Button>
                    ) : (
                         <div className="flex flex-col gap-4">
                              <Button
                                   onClick={disconnectWallet}
                                   className="bg-red-400 hover:bg-red-300 text-black font-extrabold 
                                   px-6 py-3 rounded-2xl border-4 border-black text-lg
                                   shadow-[5px_5px_0px_rgba(0,0,0,0.9)]
                                   transition-transform active:translate-x-[2px] active:translate-y-[2px]
                                   active:shadow-[2px_2px_0px_rgba(0,0,0,0.9)] cursor-pointer"
                              >
                                   🔌 Disconnect Wallet
                              </Button>
                              <Button
                                   onClick={() => fetchBalance()}
                                   disabled={loading}
                                   className="bg-green-400 hover:bg-green-300 text-black font-extrabold 
                                   px-6 py-3 rounded-2xl border-4 border-black text-lg
                                   shadow-[5px_5px_0px_rgba(0,0,0,0.9)]
                                   transition-transform active:translate-x-[2px] active:translate-y-[2px]
                                   active:shadow-[2px_2px_0px_rgba(0,0,0,0.9)] cursor-pointer disabled:opacity-70"
                              >
                                   {loading ? "🔄 Loading..." : "🔃 Refresh Balance"}
                              </Button>
                         </div>
                    )}
               </div>

               {account && (
                    <div className="bg-yellow-200 p-6 rounded-2xl border-4 border-black 
                    shadow-[6px_6px_0px_rgba(0,0,0,0.9)] text-center space-y-3">
                         <div className="text-xl font-extrabold text-purple-700">🔗 Connected</div>
                         <div className="text-sm font-semibold text-gray-800 break-all 
                         bg-white px-2 py-1 rounded-lg border-2 border-black shadow-sm">
                              {account}
                         </div>
                         <div className="text-2xl font-black text-green-600 drop-shadow-[2px_2px_0_rgba(0,0,0,0.6)]">
                              {loading
                                   ? "⏳ Fetching..."
                                   : balance
                                   ? `💰 ${balance} SOL`
                                   : "—"}
                         </div>
                    </div>
               )}

               {error && (
                    <div className="bg-red-200 border-4 border-black text-red-800 p-4 rounded-2xl font-bold 
                    text-center shadow-[4px_4px_0px_rgba(0,0,0,0.9)]">
                         ⚠️ {error}
                    </div>
               )}
          </div>
     );
};

export default ConnectPhantom;
