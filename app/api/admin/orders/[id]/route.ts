import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import User from "@/models/User";
import Setting from "@/models/Setting";
import { handleTopily, handleAgentPortal, handleDataBundlesHub } from "@/components/providers/apiProviders";

// PATCH /api/admin/orders/[id] - Retry a failed order (Admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (status !== "pending") {
      return NextResponse.json({ error: "Invalid status for retry" }, { status: 400 });
    }

    await dbConnect();
    const order = await Order.findById(id);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Set order status to pending for retry
    order.status = "pending";
    await order.save();

    const providerDoc = await Setting.findOne({ key: "provider" });
    const provider = providerDoc?.value || "agentportal";

    const TOPPILY_API_KEY = process.env.TOPPILY_API_KEY!;
    const AGENT_PORTAL_API_KEY = process.env.AGENT_PORTAL_API_KEY!;
    const DATABUNDLEHUB_API_KEY = process.env.DATABUNDLEHUB_API_KEY!;

    const data = {
      network: order.network,
      bundleName: order.bundleName,
      price: order.price,
      phoneNumber: order.phoneNumber,
      reference: order.payment_id,
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
      console.error("Retry order provider call error:", err);
    }

    const updatedOrder = await Order.findById(id).populate("user", "name email phone");
    return NextResponse.json(updatedOrder);
  } catch (error: any) {
    console.error("Error retrying order:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/admin/orders/[id] - Delete an order (Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await dbConnect();
    const deletedOrder = await Order.findByIdAndDelete(id);

    if (!deletedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Order deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting order:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
