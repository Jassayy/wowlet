import ConnectEthereum from "@/components/walletComponent/ConnectEthereum";
import ConnectPhantom from "@/components/walletComponent/ConnectPhantom";
import Portfolio from "@/components/walletComponent/Portfolio";
import { UserButton } from "@clerk/nextjs";
import React from "react";

const page = () => {
     return (
          <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
               {/* Header */}
               <header className="w-full bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 border-b-8 border-black shadow-2xl">
                    <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
                         <div className="flex items-center space-x-4">
                              <div className="text-4xl font-black text-white drop-shadow-lg">
                                   🎨 CartoonPort
                              </div>
                         </div>
                         <div className="flex items-center space-x-4">
                              <UserButton afterSignOutUrl="/" />
                         </div>
                    </div>
               </header>

               {/* Main Content */}
               <div className="max-w-7xl mx-auto px-8 py-12 space-y-12">
                    {/* Welcome Section */}
                    <div className="text-center space-y-6">
                         <h1 className="text-6xl font-black gradient-text">
                              🚀 Your Dashboard
                         </h1>
                         <p className="text-2xl font-bold text-gray-600">
                              Connect your wallets and track your crypto in
                              style! ✨
                         </p>
                    </div>

                    {/* Wallet Connection Section */}
                    <div className="cartoon-card bg-gradient-to-br from-white via-yellow-50 to-orange-50 p-8 rounded-3xl">
                         <div className="text-center mb-8">
                              <h2 className="text-4xl font-black gradient-text mb-4">
                                   🔗 Connect Your Wallets
                              </h2>
                              <p className="text-xl font-bold text-gray-600">
                                   Choose your favorite wallets to get started!
                                   🎯
                              </p>
                         </div>

                         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                              <div className="cartoon-card bg-gradient-to-br from-blue-200 to-purple-200 p-8 rounded-3xl">
                                   <div className="text-center mb-6">
                                        <div className="text-5xl mb-4">🔷</div>
                                        <h3 className="text-3xl font-black text-blue-700 mb-2">
                                             Ethereum Network
                                        </h3>
                                        <p className="text-lg font-bold text-gray-600">
                                             Connect with MetaMask 🦊
                                        </p>
                                   </div>
                                   <ConnectEthereum />
                              </div>

                              <div className="cartoon-card bg-gradient-to-br from-purple-200 to-pink-200 p-8 rounded-3xl">
                                   <div className="text-center mb-6">
                                        <div className="text-5xl mb-4">🌟</div>
                                        <h3 className="text-3xl font-black text-purple-700 mb-2">
                                             Solana Network
                                        </h3>
                                        <p className="text-lg font-bold text-gray-600">
                                             Connect with Phantom 👻
                                        </p>
                                   </div>
                                   <ConnectPhantom />
                              </div>
                         </div>
                    </div>

                    {/* Portfolio Section */}
                    <Portfolio />
               </div>
          </div>
     );
};

export default page;
