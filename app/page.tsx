import Link from "next/link";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
     const { userId } = await auth();

     return (
          <main className="min-h-screen">
               {/* Header */}
               <header className="w-full bg-gradient-to-r from-pink-400 via-purple-500 to-blue-500 border-b-8 border-black shadow-2xl">
                    <div className="max-w-7xl mx-auto px-8 py-6 flex items-center justify-between">
                         <div className="flex items-center space-x-4">
                              <div className="text-4xl font-black text-white drop-shadow-lg">
                                   🎨 CartoonPort
                              </div>
                         </div>
                         <div className="flex items-center space-x-4">
                              {userId ? (
                                   <UserButton afterSignOutUrl="/" />
                              ) : (
                                   <>
                                        <SignInButton>
                                             <button className="cartoon-button bg-yellow-400 hover:bg-yellow-300 text-black font-black px-6 py-3 rounded-2xl border-4 border-black text-lg shadow-lg">
                                                  Sign In 🚀
                                             </button>
                                        </SignInButton>
                                        <SignUpButton>
                                             <button className="cartoon-button bg-green-400 hover:bg-green-300 text-black font-black px-6 py-3 rounded-2xl border-4 border-black text-lg shadow-lg">
                                                  Sign Up ✨
                                             </button>
                                        </SignUpButton>
                                   </>
                              )}
                         </div>
                    </div>
               </header>

               {/* Hero Section */}
               <div className="flex items-center justify-center min-h-[calc(100vh-120px)] px-12">
                    <div className="max-w-5xl w-full text-center space-y-12">
                         <div className="space-y-8">
                              <h1 className="text-7xl md:text-8xl font-black tracking-tight">
                                   <span className="gradient-text">
                                        Track Your
                                   </span>
                                   <br />
                                   <span className="text-pink-500">
                                        Crypto Portfolio
                                   </span>
                                   <br />
                                   <span className="text-purple-500">
                                        Like Never Before!
                                   </span>
                              </h1>

                              <div className="text-2xl md:text-3xl font-bold text-gray-700 max-w-4xl mx-auto leading-relaxed">
                                   Connect your Ethereum & Solana wallets to see
                                   all your tokens, balances, and live USD
                                   values in a
                                   <span className="text-pink-500">
                                        {" "}
                                        super fun
                                   </span>{" "}
                                   and
                                   <span className="text-blue-500">
                                        {" "}
                                        colorful way!{" "}
                                   </span>
                                   🎯💎📈
                              </div>
                         </div>

                         <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
                              {userId ? (
                                   <Link href="/dashboard">
                                        <button className="cartoon-button bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-black px-12 py-6 rounded-3xl border-4 border-black text-2xl shadow-2xl glow-effect">
                                             Go to Dashboard 🚀
                                        </button>
                                   </Link>
                              ) : (
                                   <>
                                        <SignUpButton>
                                             <button className="cartoon-button bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-300 hover:to-blue-400 text-white font-black px-12 py-6 rounded-3xl border-4 border-black text-2xl shadow-2xl glow-effect">
                                                  Get Started Free! 🎉
                                             </button>
                                        </SignUpButton>
                                        <SignInButton>
                                             <button className="cartoon-button bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-300 hover:to-orange-400 text-black font-black px-12 py-6 rounded-3xl border-4 border-black text-2xl shadow-2xl">
                                                  I Have Account 🔑
                                             </button>
                                        </SignInButton>
                                   </>
                              )}
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-16">
                              <div className="cartoon-card bg-gradient-to-br from-pink-200 to-pink-100 p-8 rounded-3xl">
                                   <div className="text-5xl mb-4">🔗</div>
                                   <h3 className="text-2xl font-black text-pink-600 mb-3">
                                        Connect Wallets
                                   </h3>
                                   <p className="text-lg font-bold text-gray-700">
                                        MetaMask & Phantom support
                                   </p>
                              </div>
                              <div className="cartoon-card bg-gradient-to-br from-purple-200 to-purple-100 p-8 rounded-3xl">
                                   <div className="text-5xl mb-4">📊</div>
                                   <h3 className="text-2xl font-black text-purple-600 mb-3">
                                        Live Tracking
                                   </h3>
                                   <p className="text-lg font-bold text-gray-700">
                                        Real-time USD values
                                   </p>
                              </div>
                              <div className="cartoon-card bg-gradient-to-br from-blue-200 to-blue-100 p-8 rounded-3xl">
                                   <div className="text-5xl mb-4">🎨</div>
                                   <h3 className="text-2xl font-black text-blue-600 mb-3">
                                        Fun UI
                                   </h3>
                                   <p className="text-lg font-bold text-gray-700">
                                        Cartoonish & colorful
                                   </p>
                              </div>
                         </div>
                    </div>
               </div>
          </main>
     );
}
