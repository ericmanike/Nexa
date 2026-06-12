import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";

export async function GET(req: NextRequest) {
  try {
    const phoneNumber = req.nextUrl.searchParams.get("phoneNumber")?.trim();
    if (!phoneNumber || phoneNumber.length < 10) {
      return NextResponse.json(
        { found: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find all orders for this phone number, newest first
    const orders = await Order.find({ phoneNumber })
      .select("transaction_id bundleName network price status createdAt phoneNumber")
      .sort({ createdAt: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const maskPhone = (phone: string) => {
      if (!phone || phone.length < 4) return "****";
      return "*".repeat(phone.length - 4) + phone.slice(-4);
    };

    return NextResponse.json({
      found: true,
      orders: orders.map((order) => ({
        transaction_id: order.transaction_id,
        bundleName: order.bundleName,
        network: order.network,
        price: order.price,
        status: order.status,
        createdAt: order.createdAt,
        phoneNumber: maskPhone(order.phoneNumber || ""),
      })),
    });
  } catch (error) {
    console.error("Track order error:", error);
    return NextResponse.json(
      { found: false, error: "Unable to look up orders" },
      { status: 500 }
    );
  }
}
