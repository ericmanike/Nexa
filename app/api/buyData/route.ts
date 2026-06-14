import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Order from "@/models/Order";
import Bundle from "@/models/Bundle";
import Setting from "@/models/Setting";
import Transaction from "@/models/Transaction";
import { handleTopily, handleAgentPortal, handleDataBundlesHub } from "@/components/providers/apiProviders";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { network, bundleId, phoneNumber } = await req.json();

    if (!network || !bundleId || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Check if orders are closed
    const ordersClosedDoc = await Setting.findOne({ key: "ordersClosed" }).select("value");
    if (Boolean(ordersClosedDoc?.value) && (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Orders are currently closed" }, { status: 403 });
    }

    // Get user
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Determine target audience bundle price based on user's role
    const audience = user.role === "agent" ? "agent" : "user";
    const bundle = await Bundle.findOne({ _id: bundleId, isActive: true, audience });

    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found or inactive" }, { status: 404 });
    }

    // Verify sufficient balance
    if (user.walletBalance < bundle.price) {
      return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
    }

    // Deduct balance
    user.walletBalance -= bundle.price;
    await user.save();

    // Generate unique transaction reference and payment id
    const randomHex = () => Math.floor(Math.random() * 16777215).toString(16).padEnd(6, "0");
    const transactionId = `TX_${network.slice(0, 2).toUpperCase()}_${Date.now()}_${randomHex()}`;
    const paymentId = `pay_wallet_${Date.now()}_${randomHex()}`;

    // Create Transaction (debit)
    const transaction = await Transaction.create({
      user: user._id,
      transactionType: "debit",
      type: "purchase",
      amount: bundle.price,
      reference: transactionId,
      description: `Bought ${network} ${bundle.name} for ${phoneNumber}`,
      status: "success",
    });

    // Create Order (pending)
    const order = await Order.create({
      user: user._id,
      transaction_id: transactionId,
      bundleName: bundle.name,
      network,
      price: bundle.price,
      phoneNumber,
      payment_id: paymentId,
      status: "pending",
    });

    // Invoke API Provider
    const providerDoc = await Setting.findOne({ key: "provider" });
    const provider = providerDoc?.value || "agentportal";

    const TOPPILY_API_KEY = process.env.TOPPILY_API_KEY!;
    const AGENT_PORTAL_API_KEY = process.env.AGENT_PORTAL_API_KEY!;
    const DATABUNDLEHUB_API_KEY = process.env.DATABUNDLEHUB_API_KEY!;

    const providerData = {
      network,
      bundleName: bundle.name,
      price: bundle.price,
      phoneNumber,
      reference: paymentId,
    };

    let response;
    try {
      if (provider === "databundlehub") {
        response = await handleDataBundlesHub(order, providerData, DATABUNDLEHUB_API_KEY);
      } else if (provider === "toppily") {
        response = await handleTopily(order, providerData, TOPPILY_API_KEY);
      } else if (provider === "agentportal") {
        response = await handleAgentPortal(order, providerData, AGENT_PORTAL_API_KEY);
      }
    } catch (err) {
      console.error("Logged-in user buy provider call error:", err);
    }

    // Refetch the order to ensure any mutations (like transaction_id or status) are returned
    const finalOrder = await Order.findById(order._id);

    return NextResponse.json({
      success: true,
      walletBalance: user.walletBalance,
      order: finalOrder,
      transaction,
      response,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error processing user data purchase:", error);
    return NextResponse.json({ error: "Server error. Please try again." }, { status: 500 });
  }
}
