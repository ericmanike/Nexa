import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Setting from "@/models/Setting";

// GET /api/admin/settings/orders-closed - Retrieve system settings (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const ordersClosedSetting = await Setting.findOne({ key: "ordersClosed" });
    const providerSetting = await Setting.findOne({ key: "provider" });

    return NextResponse.json({
      ordersClosed: ordersClosedSetting ? Boolean(ordersClosedSetting.value) : false,
      provider: providerSetting ? String(providerSetting.value) : "dakazina",
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/admin/settings/orders-closed - Toggle ordersClosed setting (Admin only)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ordersClosed } = await req.json();

    if (ordersClosed === undefined) {
      return NextResponse.json({ error: "Missing ordersClosed field" }, { status: 400 });
    }

    await dbConnect();

    const setting = await Setting.findOneAndUpdate(
      { key: "ordersClosed" },
      { value: ordersClosed },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ordersClosed: Boolean(setting.value) });
  } catch (error: any) {
    console.error("Error toggling ordersClosed:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/admin/settings/orders-closed - Update API provider setting (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { provider } = await req.json();

    if (!provider) {
      return NextResponse.json({ error: "Missing provider field" }, { status: 400 });
    }

    await dbConnect();

    const setting = await Setting.findOneAndUpdate(
      { key: "provider" },
      { value: provider, provider },
      { upsert: true, new: true }
    );

    return NextResponse.json({ provider: String(setting.value) });
  } catch (error: any) {
    console.error("Error updating API provider:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
