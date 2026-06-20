import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get("phoneNumber");

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required." }, { status: 400 });
    }

    await dbConnect();

    const orders = await Order.find({ phoneNumber: phoneNumber.trim() })
      .sort({ createdAt: -1 })
      .limit(20);

    return NextResponse.json({
      found: orders.length > 0,
      orders,
    });
  } catch (error: any) {
    console.error("Error tracking orders by phone number:", error);
    return NextResponse.json({ error: "Failed to query tracking orders." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    
    const data = await request.json();

    const { reference, status } = data;
    console.log('Received webhook data:', data);


    const order = await Order.findOneAndUpdate(
      { transaction_id: reference,  },
      { status: status.toLowerCase() }
    );
      console.log('order found', order)
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}

