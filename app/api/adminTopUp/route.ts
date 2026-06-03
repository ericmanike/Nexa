import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

// POST /api/adminTopUp - Top up user's wallet balance (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, amount } = await req.json();
    const valAmount = parseFloat(amount);

    if (!userId || isNaN(valAmount) || valAmount <= 0) {
      return NextResponse.json({ error: "Invalid userId or amount" }, { status: 400 });
    }

    await dbConnect();

    // Find and update the user's wallet balance
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    user.walletBalance = (user.walletBalance || 0) + valAmount;
    await user.save();

    // Create a credit transaction log
    const reference = `TUP-${user._id.toString().substring(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
    await Transaction.create({
      user: user._id,
      transactionType: "credit",
      type: "topup",
      amount: valAmount,
      reference,
      description: `Admin wallet top up of GH₵ ${valAmount.toFixed(2)}`,
      status: "success",
    });

    return NextResponse.json({
      message: "Top up successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        walletBalance: user.walletBalance,
      },
    });
  } catch (error: any) {
    console.error("Error in adminTopUp:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
