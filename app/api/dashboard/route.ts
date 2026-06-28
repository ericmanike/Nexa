import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Order from "@/models/Order";
import Transaction from "@/models/Transaction";
import AgentStore from "@/models/AgentStore";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Query active user
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch user-specific recent orders
    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Fetch user-specific recent transactions
    const transactions = await Transaction.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10);

    // Fetch agent storefront
    const agentStore = await AgentStore.findOne({ user: user._id });

    // Get count statistics
    const totalOrders = await Order.countDocuments({ user: user._id });
    const placedOrders = await Order.countDocuments({
      user: user._id,
      status: "placed",
    });
    const processingOrders = await Order.countDocuments({
      user: user._id,
      status: { $in: ["pending", "processing"] },
    });
    const deliveredOrders = await Order.countDocuments({
      user: user._id,
      status: "delivered",
    });

    // Compute total spent on successful data bundle orders
    const spentAggregation = await Order.aggregate([
      { $match: { user: user._id, status: "delivered" } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const totalSpent = spentAggregation.length > 0 ? spentAggregation[0].total : 0;

    return NextResponse.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        phone: user.phone || "",
        createdAt: user.createdAt,
      },
      stats: {
        totalOrders,
        processingOrders,
        placedOrders,
        deliveredOrders,
        totalSpent,
      },
      orders,
      transactions,
      agentStore,
    });
  } catch (error: any) {
    console.error("Error fetching dashboard statistics:", error);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { storeName, description, whatsappSupport } = await req.json();

    if (!storeName || !storeName.trim()) {
      return NextResponse.json({ error: "Store name is required" }, { status: 400 });
    }

    await dbConnect();

    // Query active user
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }


    // Find or create agent storefront
    let agentStore = await AgentStore.findOne({ user: user._id });
    if (!agentStore) {
      // Create slug from username or unique suffix
      const baseSlug = user.name.toLowerCase().replace(/[^a-z0-9]/g, "") || "store";
      const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
      agentStore = new AgentStore({
        user: user._id,
        storeName: storeName.trim(),
        slug,
        description: (description || "").trim(),
        whatsappSupport: (whatsappSupport || "").trim(),
      });
    } else {
      agentStore.storeName = storeName.trim();
      agentStore.description = (description || "").trim();
      agentStore.whatsappSupport = (whatsappSupport || "").trim();
    }

    await agentStore.save();

    return NextResponse.json({ success: true, agentStore });
  } catch (error: any) {
    console.error("Error updating storefront settings:", error);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
