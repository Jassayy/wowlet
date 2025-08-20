
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
          <div className="space-y-4">
               <div className="flex flex-col gap-3">
                    {!account ? (
                         <Button
                              onClick={connectWallet}
                              className="cartoon-button bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-black px-6 py-4 rounded-2xl border-4 border-black text-lg shadow-lg w-full"
                         >
                              👻 Connect Phantom
                         </Button>
                    ) : (
                         <div className="flex flex-col gap-3">
                              <Button
                                   onClick={disconnectWallet}
                                   className="cartoon-button bg-gradient-to-r from-red-400 to-pink-500 hover:from-red-300 hover:to-pink-400 text-white font-black px-6 py-3 rounded-2xl border-4 border-black text-lg shadow-lg"
                              >
                                   🔌 Disconnect Wallet
                              </Button>
                              <Button
                                   onClick={() => fetchBalance()}
                                   disabled={loading}
                                   className="cartoon-button bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-300 hover:to-blue-400 text-white font-black px-6 py-3 rounded-2xl border-4 border-black text-lg shadow-lg"
                              >
                                   {loading ? "🔄 Loading..." : "🔃 Refresh Balance"}
                              </Button>
                         </div>
                    )}
               </div>

               {account && (
                    <div className="cartoon-card bg-gradient-to-br from-purple-100 to-pink-100 p-4 rounded-2xl">
                         <div className="text-center space-y-2">
                              <div className="text-lg font-bold text-purple-700">🔗 Connected</div>
                              <div className="text-sm font-semibold text-gray-600 break-all">
                                   {account}
                              </div>
                              <div className="text-xl font-black text-green-600">
                                   {loading
                                        ? "⏳ Fetching..."
                                        : balance
                                        ? `💰 ${balance} SOL`
                                        : "—"}
                              </div>
                         </div>
                    </div>
               )}

               {error && (
                    <div className="cartoon-border bg-red-100 border-red-500 text-red-700 p-3 rounded-2xl text-center font-bold">
                         ⚠️ {error}
                    </div>
               )}
          </div>
     );
};

export default ConnectPhantom;
