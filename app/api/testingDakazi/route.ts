import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json({
      AccountBalance: {
        "Wallet Balance": 345.50,
      },
      spendlessBalance: {
        data: {
          balance: 1820.75,
        },
      },
    });
  } catch (error: any) {
    console.error("Error in testingDakazi route:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
