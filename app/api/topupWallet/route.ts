import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { topUpRateLimit } from "@/lib/ratelimit";

export async function POST(req:NextRequest){
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
 

        let clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                       req.headers.get("x-real-ip") ||
                       req.headers.get("cf-connecting-ip") ||
                       "127.0.0.1";
    
        if (clientIp === "::1" || clientIp === "::ffff:127.0.0.1") {
          clientIp = "127.0.0.1";
        }
    
        const userId = (session.user as any).id;
        const userKey = `buyData:user:${userId}`;
        const ipKey = `buyData:ip:${clientIp}`;
    
        try {
          const [userCheck, ipCheck] = await Promise.all([
            topUpRateLimit.limit(userKey),
            topUpRateLimit.limit(ipKey),
          ]);
    
          if (!userCheck.success || !ipCheck.success) {
            return NextResponse.json({ error: "Too many order attempts. Please try again in 5 minutes." }, { status: 429 });
          }
        } catch (rateErr) {
          console.warn("Rate limit check warning:", rateErr);
        }

  






    try {
        await dbConnect();

        const {email , amount, reference} = await req.json();

        // Validate top-up amount
        if (typeof amount !== 'number' || amount <= 10 || isNaN(amount)) {
            return NextResponse.json({ message: "Invalid top-up amount" }, { status: 400 });
        }

        const user = await User.findOne({email});
        if(!user){
            console.log("User not found", user)
            return NextResponse.json({message:"Unauthorized access"} , {status:400})
        }

        const updatedUser:any = await User.findOneAndUpdate(
            { _id: user._id },
            { $inc: { walletBalance: amount } },
            { returnDocument: 'after', session: mongoSession }
        );

        console.log("Updated user", updatedUser)
        
        if (!updatedUser) {
            console.log('User update failed.');
            return NextResponse.json({ message: "User update failed. Transaction cancelled." }, { status: 400 });
        }
  
        if (reference) {
            await Transaction.create([{
                user: user._id,
                transactionType: 'credit',
                type: 'topup',
                amount: amount,
                reference: reference,
                description: `Wallet top-up of GH₵${amount}`,
                status: 'success'
            }], { session: mongoSession });
        }

        await mongoSession.commitTransaction();

        console.log("User wallet balance updated", updatedUser.walletBalance)

        return NextResponse.json({message:"Wallet top-up successful"} , {status:200})

    } catch (error) {
        if( mongoSession.inTransaction()){
            await mongoSession.abortTransaction();
        }
        console.error("Wallet top-up error:", error);
        return NextResponse.json({ message: "Wallet top-up failed", error: (error as Error).message }, { status: 500 });
    } finally {
        await mongoSession.endSession();
    }
}
