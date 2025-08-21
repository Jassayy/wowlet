import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { currentUser } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";

const Navbar = async () => {
     const user = await currentUser();
     return (
          <nav className="w-full border-b bg-white fixed z-10 shadow-xl">
               <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                         {/* Logo */}
                         <Link href="/" className="flex items-center space-x-2">
                              <div
                                   className="bg-rose-600 text-white font-bold px-4 py-2 rounded-lg border-2 border-black 
               shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] 
               transition-transform active:translate-x-[2px] active:translate-y-[2px] 
               active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                              >
                                   WOWLET
                              </div>
                         </Link>

                         {/* Sign Up Button */}
                         <div className="flex-shrink-0">
                              {!user ? (
                                   <Link href="/sign-up">
                                        <Button
                                             variant="default"
                                             size="default"
                                             className="font-medium bg-yellow-300 text-black cursor-pointer 
                 hover:bg-yellow-400 
                 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] 
                 border-2 border-black 
                 rounded-lg transition-transform active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                                        >
                                             Sign Up
                                        </Button>
                                   </Link>
                              ) : (
                                   <UserButton />
                              )}
                         </div>
                    </div>
               </div>
          </nav>
     );
};

export default Navbar;
