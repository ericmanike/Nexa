import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Setting from "@/models/Setting";

// GET /api/admin/settings/agent-fee - Retrieve agent registration price (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const feeSetting = await Setting.findOne({ key: "agentUpgradeFee" });
    const fee = feeSetting && !isNaN(Number(feeSetting.value)) ? Number(feeSetting.value) : 50;

    return NextResponse.json({ agentUpgradeFee: fee });
  } catch (error: any) {
    console.error("Error fetching agent registration fee:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/admin/settings/agent-fee - Update agent registration price (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { agentUpgradeFee } = await req.json();
    const numericFee = Number(agentUpgradeFee);

    if (isNaN(numericFee) || numericFee < 0) {
      return NextResponse.json({ error: "Invalid registration price value" }, { status: 400 });
    }

    await dbConnect();
    const setting = await Setting.findOneAndUpdate(
      { key: "agentUpgradeFee" },
      { value: numericFee },
      { upsert: true, returnDocument: 'after' }
    );

    return NextResponse.json({
      success: true,
      agentUpgradeFee: Number(setting.value),
    });
  } catch (error: any) {
    console.error("Error updating agent registration fee:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
