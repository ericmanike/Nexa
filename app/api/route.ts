import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import { NextResponse } from "next/server";

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

