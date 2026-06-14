import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import Bundle from "@/models/Bundle";
import Setting from "@/models/Setting";
import { handleTopily, handleAgentPortal, handleDataBundlesHub } from "@/components/providers/apiProviders";

// POST /api/admin/orders/create - Manually create an order (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { network, bundleName, phoneNumber } = await req.json();

    if (!network || !bundleName || !phoneNumber) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Look up the bundle to get the correct price
    // e.g. bundleName is "1" or "1.5" or "1GB" or "1.5GB"
    const formattedBundleName = bundleName.toUpperCase().endsWith("GB") ? bundleName : `${bundleName}GB`;
    const bundle = await Bundle.findOne({
      network: { $regex: new RegExp(`^${network}$`, "i") },
      name: { $regex: new RegExp(`^${formattedBundleName}$`, "i") },
    });

    const price = bundle ? bundle.price : 0;

    // Generate unique transaction_id and payment_id
    const randomHex = () => Math.floor(Math.random() * 16777215).toString(16).padEnd(6, "0");
    const transactionId = `${Date.now()}_${randomHex()}`;
    const paymentId = `pay_admin_${Date.now()}_${randomHex()}`;

    const order = await Order.create({
      user: (session.user as any).id, // Admin creating it is linked as the user or optional
      transaction_id: transactionId,
      bundleName,
      network,
      price,
      phoneNumber,
      payment_id: paymentId,
      status: "pending",
    });

    const providerDoc = await Setting.findOne({ key: "provider" });
    const provider = providerDoc?.value || "agentportal";

    const TOPPILY_API_KEY = process.env.TOPPILY_API_KEY!;
    const AGENT_PORTAL_API_KEY = process.env.AGENT_PORTAL_API_KEY!;
    const DATABUNDLEHUB_API_KEY = process.env.DATABUNDLEHUB_API_KEY!;

    const data = {
      network,
      bundleName,
      price,
      phoneNumber,
      reference: paymentId,
    };

    let response;
    try {
      if (provider === "databundlehub") {
        response = await handleDataBundlesHub(order, data, DATABUNDLEHUB_API_KEY);
      } else if (provider === "toppily") {
        response = await handleTopily(order, data, TOPPILY_API_KEY);
      } else if (provider === "agentportal") {
        response = await handleAgentPortal(order, data, AGENT_PORTAL_API_KEY);
      }
    } catch (err) {
      console.error("Manual order provider call error:", err);
    }

    const populatedOrder = await Order.findById(order._id).populate("user", "name email phone");

    return NextResponse.json({
      message: "Order created successfully",
      order: populatedOrder,
      response,
    });
  } catch (error: any) {
    console.error("Error creating manual order:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
