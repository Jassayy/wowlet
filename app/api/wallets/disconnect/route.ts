import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
     const user = await currentUser();
     if (!user)
          return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

     const { address } = await req.json();

     // Option 1: Delete the wallet entirely
     await prisma.wallet.deleteMany({
          where: { address, userId: user.id },
     });

     // Option 2: Or just nullify userId if you want to keep the wallet in DB
     // await prisma.wallet.updateMany({
     //   where: { address, userId: user.id },
     //   data: { userId: null },
     // });

     return NextResponse.json({ success: true });
}
