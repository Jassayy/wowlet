import ConnectEthereum from "@/components/walletComponent/ConnectEthereum";
import ConnectPhantom from "@/components/walletComponent/ConnectPhantom";
import Portfolio from "@/components/walletComponent/Portfolio";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const Dashboard = async () => {
     const user = await currentUser();

     if (!user) redirect("/");

     return (
          <div className="min-h-screen max-w-5xl mx-auto p-6">
               <h1 className="text-3xl font-bold text-center mb-8">
                    Dashboard
               </h1>

               {/* Wallets Section */}
               <div className="flex justify-center gap-6 mb-10">
                    <div className="w-full max-w-sm p-4 rounded-2xl shadow-md">
                         <ConnectEthereum />
                    </div>
                    <div className="w-full max-w-sm p-4 rounded-2xl shadow-md">
                         <ConnectPhantom />
                    </div>
               </div>

               {/* Portfolio Section */}
               <div className="p-6 rounded-2xl shadow-md">
                    <Portfolio />
               </div>
          </div>
     );
};

export default Dashboard;
