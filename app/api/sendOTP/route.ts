import { NextResponse,NextRequest } from "next/server";

import { sendOTP } from "@/lib/bulkclick";

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    const result = await sendOTP(phone);
    console.log("sendOTP API Result:", result);
    return NextResponse.json(result);
  } catch (err) {
    console.error("sendOTP API Error:", err);
    return NextResponse.json(
      { success: false, message: "Something unexpected happened" },
      { status: 500 }
    );
  }
}