import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { WalletType } from "@prisma/client";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
     const user = await currentUser();

     if (!user)
          return NextResponse.json(
               { error: "Unauthorized " },
               {
                    status: 401,
               }
          );

     const body = await req.json();
     const { address, type } = body;

     const walletType: WalletType =
          type.toUpperCase() === "ETHEREUM"
               ? WalletType.ETHEREUM
               : WalletType.SOLANA;

     //create user in db if not exists
     //we will handle it differently by using webhooks by clerk later on
     //manually saving user in db
     await prisma.user.upsert({
          where: { id: user.id },
          update: {},
          create: {
               id: user.id,
               clerkId: user.id,
               email: user.emailAddresses[0].emailAddress,
          },
     });

     //upsert function will help us create wallet if not already exists and update it if it already exists or push it in the users wallets
     const wallet = await prisma.wallet.upsert({
          where: { address },
          update: {
               userId: user.id,
          },
          create: {
               address,
               type: walletType,
               userId: user.id,
          },
     });

     return NextResponse.json(wallet);
}
