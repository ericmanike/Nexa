import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Transaction from "@/models/Transaction";
import User from "@/models/User";

// GET /api/admin/transactions - Get all system transactions (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const transactions = await Transaction.find({})
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });

    return NextResponse.json(transactions);
  } catch (error: any) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
