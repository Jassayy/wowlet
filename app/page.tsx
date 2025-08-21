import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
     return (
          <main className="min-h-screen max-w-5xl mx-auto px-6 pt-24 pb-16 flex flex-col items-center justify-center space-y-16">
               {/* Hero Section */}
               <section className="text-center space-y-6">
                    <h1 className="text-5xl font-extrabold text-pink-600 leading-tight drop-shadow-[4px_4px_0_rgba(0,0,0,0.9)]">
                         Track Your{" "}
                         <span className="bg-purple-400 px-2 border-2 border-black rounded-lg shadow-[4px_4px_0px_rgba(0,0,0,0.9)] text-white">
                              Crypto
                         </span>
                         <br />
                         Portfolio in One Place 💰
                    </h1>
                    <p className="text-lg text-purple-700 max-w-2xl mx-auto">
                         Connect your{" "}
                         <span className="font-bold">MetaMask</span> and{" "}
                         <span className="font-bold">Phantom</span> wallets to
                         easily view, track, and manage all your crypto assets —
                         all in one dashboard.
                    </p>

                    <div className="flex gap-6 justify-center pt-4">
                         <Link href="/sign-up">
                              <Button
                                   className="bg-white text-black font-bold px-6 py-3 rounded-lg border-2 border-black
               shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:bg-neutral-200
               transition-transform active:translate-x-[2px] active:translate-y-[2px]
               active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] cursor-pointer"
                              >
                                   🚀 Connect Wallet
                              </Button>
                         </Link>
                    </div>
               </section>

               {/* Features Section */}
               <section className="grid md:grid-cols-3 gap-8 w-full">
                    <div className="bg-pink-100 p-6 rounded-xl border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,0.9)]">
                         <h2 className="text-xl font-bold mb-2 text-pink-600">
                              🔗 Easy Wallet Connect
                         </h2>
                         <p className="text-purple-800">
                              Connect MetaMask or Phantom with one click — no
                              hassle, just secure and fast.
                         </p>
                    </div>

                    <div className="bg-green-100 p-6 rounded-xl border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,0.9)]">
                         <h2 className="text-xl font-bold mb-2 text-green-600">
                              📈 Real-Time Portfolio
                         </h2>
                         <p className="text-green-800">
                              Track all your crypto assets in real time with a
                              clean, intuitive dashboard.
                         </p>
                    </div>

                    <div className="bg-yellow-100 p-6 rounded-xl border-2 border-black shadow-[6px_6px_0px_rgba(0,0,0,0.9)]">
                         <h2 className="text-xl font-bold mb-2 text-yellow-600">
                              🔒 Secure by Design
                         </h2>
                         <p className="text-yellow-800">
                              Your wallet keys stay safe — we never store them.
                              Full control stays with you.
                         </p>
                    </div>
               </section>

               {/* Call to Action */}
               <section className="text-center space-y-4">
                    <h2 className="text-3xl font-extrabold drop-shadow-[3px_3px_0_rgba(0,0,0,0.9)] text-purple-600">
                         Ready to Manage Your Crypto Like a Pro? 🚀
                    </h2>
                    <Link href="sign-up">
                         <Button
                              className="bg-teal-400 text-white font-bold px-8 py-4 rounded-lg border-2 border-black
             shadow-[5px_5px_0px_0px_rgba(0,0,0,0.9)] hover:bg-teal-600
             transition-transform active:translate-x-[2px] active:translate-y-[2px]
             active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] cursor-pointer"
                         >
                              Get Started Now
                         </Button>
                    </Link>
               </section>
          </main>
     );
}
