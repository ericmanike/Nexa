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
    const agentFeeSetting = await Setting.findOne({ key: "agentUpgradeFee" });

    return NextResponse.json({
      ordersClosed: ordersClosedSetting ? Boolean(ordersClosedSetting.value) : false,
      provider: providerSetting ? String(providerSetting.value) : "dakazina",
      agentUpgradeFee: agentFeeSetting && !isNaN(Number(agentFeeSetting.value)) ? Number(agentFeeSetting.value) : 50,
    });
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/admin/settings/orders-closed - Update settings (ordersClosed, agentUpgradeFee, provider)
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    const responseData: Record<string, any> = {};

    if (body.ordersClosed !== undefined) {
      const setting = await Setting.findOneAndUpdate(
        { key: "ordersClosed" },
        { value: body.ordersClosed },
        { upsert: true, returnDocument: 'after' }
      );
      responseData.ordersClosed = Boolean(setting.value);
    }

    if (body.agentUpgradeFee !== undefined) {
      const fee = Number(body.agentUpgradeFee);
      if (isNaN(fee) || fee < 0) {
        return NextResponse.json({ error: "Invalid agent upgrade fee price" }, { status: 400 });
      }
      const setting = await Setting.findOneAndUpdate(
        { key: "agentUpgradeFee" },
        { value: fee },
        { upsert: true, returnDocument: 'after' }
      );
      responseData.agentUpgradeFee = Number(setting.value);
    }

    if (body.provider !== undefined) {
      const setting = await Setting.findOneAndUpdate(
        { key: "provider" },
        { value: body.provider, provider: body.provider },
        { upsert: true, returnDocument: 'after' }
      );
      responseData.provider = String(setting.value);
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/admin/settings/orders-closed - Update API provider setting (Admin only)
export async function POST(req: Request) {
  return PATCH(req);
}
