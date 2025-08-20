
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
          <div className="space-y-4">
               <div className="flex flex-col gap-3">
                    {!account ? (
                         <Button
                              onClick={connectWallet}
                              className="cartoon-button bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white font-black px-6 py-4 rounded-2xl border-4 border-black text-lg shadow-lg w-full"
                         >
                              🦊 Connect MetaMask
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
                    <div className="cartoon-card bg-gradient-to-br from-blue-100 to-purple-100 p-4 rounded-2xl">
                         <div className="text-center space-y-2">
                              <div className="text-lg font-bold text-blue-700">🔗 Connected</div>
                              <div className="text-sm font-semibold text-gray-600 break-all">
                                   {account}
                              </div>
                              <div className="text-xl font-black text-green-600">
                                   {loading
                                        ? "⏳ Fetching..."
                                        : balance
                                        ? `💰 ${balance} ETH`
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

export default ConnectEthereum;
