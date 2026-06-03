import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Withdrawal from "@/models/Withdrawal";
import User from "@/models/User";
import Transaction from "@/models/Transaction";

// GET /api/admin/withdrawals - Fetch all agent withdrawal requests (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const withdrawals = await Withdrawal.find({})
      .populate("agent", "name email")
      .sort({ createdAt: -1 });

    return NextResponse.json(withdrawals);
  } catch (error: any) {
    console.error("Error fetching withdrawals:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/admin/withdrawals - Approve or reject a withdrawal request (Admin only)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, status } = await req.json();

    if (!id || !["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    await dbConnect();

    // Find the withdrawal request
    const withdrawal = await Withdrawal.findById(id);
    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json({ error: "Withdrawal request already processed" }, { status: 400 });
    }

    // Update withdrawal status
    withdrawal.status = status;
    await withdrawal.save();

    // Find the corresponding pending debit transaction
    const prefix = `WDR-${withdrawal._id.toString().substring(0, 8).toUpperCase()}`;
    const transaction = await Transaction.findOne({
      user: withdrawal.agent,
      reference: { $regex: new RegExp(`^${prefix}`) },
    });

    if (status === "approved") {
      if (transaction) {
        transaction.status = "success";
        await transaction.save();
      }
    } else if (status === "rejected") {
      if (transaction) {
        transaction.status = "failed";
        await transaction.save();
      }

      // Refund the agent
      const agent = await User.findById(withdrawal.agent);
      if (agent) {
        agent.walletBalance = (agent.walletBalance || 0) + withdrawal.amount;
        await agent.save();
      }
    }

    return NextResponse.json({
      message: `Withdrawal request successfully ${status}`,
      withdrawal,
    });
  } catch (error: any) {
    console.error("Error processing withdrawal:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
