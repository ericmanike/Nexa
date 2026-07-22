import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Order from "@/models/Order";
import Transaction from "@/models/Transaction";
import Setting from "@/models/Setting";
import { buyAfaDataRateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";

// GET /api/afa - Fetch the current AFA registration price
export async function GET() {
  try {
    await dbConnect();
    const afaPriceDoc = await Setting.findOne({ key: "afaRegistrationPrice" });
    const price = afaPriceDoc && afaPriceDoc.value !== undefined ? Number(afaPriceDoc.value) : 5.0;
    return NextResponse.json({ price });
  } catch (error: any) {
    console.error("Error fetching AFA registration price:", error);
    return NextResponse.json({ error: "Failed to fetch price" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifier = (session.user as any).id || request.headers.get("x-forwarded-for") || "anonymous";
    try {
      const { success } = await buyAfaDataRateLimit.limit(identifier);
      if (!success) {
        return NextResponse.json({ error: "Too many AFA order attempts. Please wait 5 minutes." }, { status: 429 });
      }
    } catch (rateErr) {
      console.warn("Rate limit check warning:", rateErr);
    }

    const { fullName, phoneNumber, ghanaCard, location } = await request.json();

    // Validations
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: "Full Name is required" }, { status: 400 });
    }
    if (!phoneNumber || !/^\d{10}$/.test(phoneNumber)) {
      return NextResponse.json({ error: "A valid 10-digit phone number is required" }, { status: 400 });
    }
    if (!ghanaCard || !/^GHA-\d{9}-\d$/i.test(ghanaCard)) {
      return NextResponse.json({ error: "A valid Ghana Card number in the format GHA-XXXXXXXXX-X is required" }, { status: 400 });
    }
    if (!location || location.trim().length < 3) {
      return NextResponse.json({ error: "A detailed location/address (min 3 chars) is required" }, { status: 400 });
    }

    await dbConnect();

    // Fetch the dynamic price from settings
    const afaPriceDoc = await Setting.findOne({ key: "afaRegistrationPrice" });
    const AFA_REGISTRATION_PRICE = afaPriceDoc && afaPriceDoc.value !== undefined ? Number(afaPriceDoc.value) : 5.0;

    // Get current user and verify balance
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.walletBalance < AFA_REGISTRATION_PRICE) {
      return NextResponse.json({ error: "Insufficient wallet balance." }, { status: 400 });
    }

    // Deduct wallet balance
    user.walletBalance -= AFA_REGISTRATION_PRICE;
    await user.save();

    const newTxId = `NEXA-AFA-${Math.floor(100000 + Math.random() * 900000)}`;

    // Create Order
    const order = await Order.create({
      user: user._id,
      transaction_id: newTxId,
      bundleName: "AFA Registration Package",
      network: "MTN",
      price: AFA_REGISTRATION_PRICE, 
      phoneNumber,
      payment_id: `afa-${Date.now()}-${Math.floor(100000 + Math.random() * 900000)}`,
      status: "processing", // Automatically set to delivered as registered successfully
      fullName: fullName.trim(),  
      ghanaCard: ghanaCard.trim().toUpperCase(),
      location: location.trim(),
    });


    // Create Transaction Log
    await Transaction.create({
      user: user._id,
      transactionType: "debit",
      type: "purchase",
      amount: AFA_REGISTRATION_PRICE,
      reference: newTxId,
      description: `AFA registration for ${fullName.trim()} (${phoneNumber})`,
      status: "success",
    });

    return NextResponse.json({
      success: true,
      message: "AFA Registration successful",
      walletBalance: user.walletBalance,
      order,
    });
  } catch (error: any) {
    console.error("AFA registration error:", error);
    return NextResponse.json(
      { error: "Server error. Please try again." },
      { status: 500 }
    );
  }
}
