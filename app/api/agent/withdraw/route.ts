import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Withdrawal from "@/models/Withdrawal";
import Transaction from "@/models/Transaction";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const { amount, phoneNumber, momoName } = await req.json();

    // Field validations
    const valAmount = parseFloat(amount);
    if (isNaN(valAmount) || valAmount < 50) {
      return NextResponse.json(
        { error: "Minimum withdrawal amount is GH₵ 50.00" },
        { status: 400 }
      );
    }

    if (!phoneNumber || phoneNumber.trim().length < 10) {
      return NextResponse.json(
        { error: "Valid MoMo phone number is required (min 10 characters)" },
        { status: 400 }
      );
    }

    if (!momoName || !momoName.trim()) {
      return NextResponse.json(
        { error: "MoMo account name is required" },
        { status: 400 }
      );
    }

    // Retrieve agent profile
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "Agent account not found" }, { status: 404 });
    }

    // Balance check
    if (user.walletBalance < valAmount) {
      return NextResponse.json(
        { error: "Insufficient wallet balance for this withdrawal" },
        { status: 400 }
      );
    }

    // Deduct amount from wallet balance
    user.walletBalance -= valAmount;
    await user.save();

    // Create a new pending withdrawal log
    const withdrawal = await Withdrawal.create({
      agent: user._id,
      amount: valAmount,
      phoneNumber,
      momoName,
      status: "pending",
    });

    // Create a corresponding debit transaction
    await Transaction.create({
      user: user._id,
      transactionType: "debit",
      type: "purchase", // matches enum constraint
      amount: valAmount,
      reference: `WDR-${withdrawal._id.toString().substring(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`,
      description: `Withdrawal request of GH₵ ${valAmount.toFixed(2)} to ${momoName} (${phoneNumber})`,
      status: "pending",
    });

    return NextResponse.json({
      message: "Withdrawal request submitted successfully.",
      withdrawal,
      newBalance: user.walletBalance,
    });
  } catch (error: any) {
    console.error("Error processing agent withdrawal:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
