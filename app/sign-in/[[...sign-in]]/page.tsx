import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Page() {
     return (
          <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
               {/* Cartoon Back Button */}
               <div className="w-full max-w-md flex justify-start">
                    <Link href="/">
                         <Button
                              className="bg-white text-black font-semibold px-4 py-2 rounded-lg 
                       shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)]
                       hover:bg-neutral-200
                       transition-transform 
                       active:translate-x-[2px] active:translate-y-[2px] 
                       active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] cursor-pointer border border-black"
                         >
                              ← Back
                         </Button>
                    </Link>
               </div>

               {/* Clerk Signup Form */}
               <SignIn
                    appearance={{
                         elements: {
                              formButtonPrimary:
                                   "bg-yellow-300 text-black font-semibold border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:bg-yellow-400 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)]",
                         },
                    }}
               />
          </div>
     );
}
