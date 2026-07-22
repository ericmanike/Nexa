import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Order from "@/models/Order";
import Setting from "@/models/Setting";
import {handleTopily, handleAgentPortal,handleDataBundlesHub } from "@/components/providers/apiProviders";
import { createOrder } from "@/lib/orderService";
import Transaction from "@/models/Transaction";
import { validateBody, buyDataNoAccountSchema } from "@/lib/schemas";
import { buyDataRateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  try {
    
    // Session is optional — guests can place orders too
    const session = await getServerSession(authOptions);

    let clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
                   req.headers.get("x-real-ip") ||
                   req.headers.get("cf-connecting-ip") ||
                   "127.0.0.1";

    if (clientIp === "::1" || clientIp === "::ffff:127.0.0.1") {
      clientIp = "127.0.0.1";
    }

    const identifier = session?.user?.id ? `buyDataGuest:user:${session.user.id}` : `buyDataGuest:ip:${clientIp}`;
    try {
      const { success } = await buyDataRateLimit.limit(identifier);
      if (!success) {
        return NextResponse.json({ message: "Too many order attempts. Please try again later." }, { status: 429 });
      }
    } catch (rateErr) {
      console.warn("Rate limit check warning:", rateErr);
    }

    const validation = await validateBody(req, buyDataNoAccountSchema);
    if (!validation.success) {
      return validation.response;
    }

    const { network, bundleName, price, phoneNumber, reference } = validation.data;

    await dbConnect();

    const ordersClosedDoc = await Setting.findOne({ key: "ordersClosed" }).select("value");
    if (Boolean(ordersClosedDoc?.value) && session?.user?.role !== "admin") {
      return NextResponse.json({ message: "Orders are currently closed" }, { status: 403 });
    }


  
      
  

    // prevent replay attack
    const existingOrder = await Order.findOne({ payment_id: reference });
    if (existingOrder) {
      return NextResponse.json({ message: "Duplicate transaction reference" }, { status: 409 });
    }


    const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY
  

    if (!PAYSTACK_SECRET_KEY) {
      console.log('Paystack secret key not found')
      return NextResponse.json({ message: "unexpected error occurred" }, { status: 500 });
    }


    


    const verifyResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    })

    const paystackData = await verifyResponse.json()

    //  console.log('Payment verification response:', paystackData)
    if (!paystackData.data) {
      console.log('Payment verification failed no data')
      return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
    }

    const { amount } = paystackData.data

    const realPrice = await Order.findOne({ bundleName: bundleName , audience: session?.user?.role}).select("price") || 'user';


    const tax = 0.02 * price
    let total = price + tax
    console.log('Total before rounding:', total)
    total = Math.round(total * 100) / 100
    console.log('Total after rounding:', total)


    console.log('Expected price:')
    console.log('Payment amount:', amount / 100)

    if (amount / 100 !== Number(total)) {
      console.log('Payment amount does not match')
      return NextResponse.json({ message: "Payment amount does not match" }, { status: 400 });
    }

    if (paystackData.data.status !== 'success') {
      console.log('Payment verification failed')
      return NextResponse.json({ message: "Payment verification failed" }, { status: 400 });
    }


    
    const TOPPILY_API_KEY = process.env.TOPPILY_API_KEY!;
    const AGENT_PORTAL_API_KEY = process.env.AGENT_PORTAL_API_KEY!;
    const DATABUNDLEHUB_API_KEY = process.env.DATABUNDLEHUB_API_KEY!;

    if (!TOPPILY_API_KEY || !AGENT_PORTAL_API_KEY ) {
      return NextResponse.json({ message: "unexpected error occurred" }, { status: 500 });
    }
    const data = {
      network,
      bundleName,
      price,
      phoneNumber,
      reference,
    }
    
    const order = await createOrder(session, data);

    if(session?.user?.id){
        await Transaction.create({
            user: session?.user?.id,  
            transactionType: 'debit',
            type: 'purchase',
            amount: total,
            reference: reference,
            description: `Purchase of ${network} ${bundleName}GB for ${phoneNumber} via Paystack`,
            status: 'success'
        });
    }
    



    const providerDoc = await Setting.findOne({ key: "provider" });
    const provider = providerDoc?.value || "agentportal";

    let response;

    if (provider === "databundlehub") {
      response = await handleDataBundlesHub(order, data, DATABUNDLEHUB_API_KEY);
    }else if (provider === "toppily") {
      response = await handleTopily(order, data, TOPPILY_API_KEY);
    } else if (provider === "agentportal") {
      response = await handleAgentPortal(order, data, AGENT_PORTAL_API_KEY);
    }

    
    return NextResponse.json(
      { message: "Order created successfully", response },
      { status: 201 }
    );

  


  } catch (error) {
    console.log('Error creating order:', error)
  
    return NextResponse.json({ message: "Error creating order" }, { status: 500 });
  }
}
