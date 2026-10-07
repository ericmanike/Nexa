import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Transaction from "@/models/Transaction";
import Setting from "@/models/Setting";
import AgentStore from "@/models/AgentStore";

// Helper to get configured agent upgrade fee
async function getUpgradeFee(): Promise<number> {
  const feeDoc = await Setting.findOne({ key: { $in: ["agentUpgradeFee", "upgradeFee"] } });
  if (feeDoc && feeDoc.value !== undefined && feeDoc.value !== null) {
    const parsed = Number(feeDoc.value);
    return isNaN(parsed) ? 50 : parsed;
  }
  return 50; // Default upgrade fee GH₵ 50.00
}

// GET /api/role-upgrade - Get upgrade fee & current user role info
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const fee = await getUpgradeFee();

    return NextResponse.json({
      role: user.role,
      isAgent: user.role === "agent" || user.role === "admin" || user.role === "moderator",
      walletBalance: user.walletBalance,
      upgradeFee: fee,
    });
  } catch (error: any) {
    console.error("Error fetching role upgrade info:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/role-upgrade - Atomically check balance and upgrade user role to agent
export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userId = (session.user as any).id;
    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user is already an agent or admin
    if (user.role === "agent") {
      return NextResponse.json(
        { message: "You are already an Agent", role: user.role, walletBalance: user.walletBalance },
        { status: 200 }
      );
    }
    if (user.role === "admin" || user.role === "moderator") {
      return NextResponse.json(
        { message: `Your current role is ${user.role}, upgrade not applicable`, role: user.role, walletBalance: user.walletBalance },
        { status: 200 }
      );
    }

    const upgradeFee = await getUpgradeFee();

    // Atomic deduction and role update to prevent race conditions or double spending
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id, walletBalance: { $gte: upgradeFee } },
      {
        $inc: { walletBalance: -upgradeFee },
        $set: { role: "agent" },
      },
      { returnDocument: "after" }
    );

    if (!updatedUser) {
      return NextResponse.json(
        {
          error: `Insufficient wallet balance to upgrade to Agent. Fee: GH₵ ${upgradeFee.toFixed(
            2
          )}. Your balance: GH₵ ${user.walletBalance.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // Record transaction log if fee > 0
    let transaction = null;
    if (upgradeFee > 0) {
      const randomHex = () =>
        Math.floor(Math.random() * 16777215)
          .toString(16)
          .padEnd(6, "0");
      const reference = `TX_UPGRADE_${Date.now()}_${randomHex()}`;

      transaction = await Transaction.create({
        user: user._id,
        transactionType: "debit",
        type: "deduction",
        amount: upgradeFee,
        reference,
        description: "Agent Role Upgrade Fee",
        status: "success",
      });
    }

    // Ensure AgentStore is initialized for the user
    let agentStore = await AgentStore.findOne({ user: user._id });
    if (!agentStore) {
      const baseSlug = user.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "store";
      const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      agentStore = await AgentStore.create({
        user: user._id,
        storeName: `${user.name}'s Store`,
        slug,
        description: "Get affordable internet data packages.",
        isActive: true,
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Successfully upgraded role to Agent!",
        user: {
          id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          walletBalance: updatedUser.walletBalance,
        },
        walletBalance: updatedUser.walletBalance,
        transaction,
        agentStore,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error processing role upgrade:", error);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
