import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agentPortalKey = process.env.AGENT_PORTAL_API_KEY;
    let agentPortalBalance = null;

    if (agentPortalKey) {
      try {
        const apRes = await fetch("https://api.agentportalgh.com/api/wallet", {
          method: "GET",
          headers: {
            "x-api-key": agentPortalKey,
            "Content-Type": "application/json",
          },
        });
        if (apRes.ok) {
          const apData = await apRes.json();
          agentPortalBalance = {
            balance: apData.balance,
          };
        }
      } catch (err) {
        console.error("Error fetching Agent Portal balance:", err);
      }
    }

    const toppilyKey = process.env.TOPPILY_API_KEY;
    let toppilyBalance = null;

    if (toppilyKey) {
      try {
        let res = await fetch("https://toppily.com/api/v1//check-console-balance", {
          method: "GET",
          headers: {
            "x-api-key": toppilyKey,
            "Content-Type": "application/json",
          },
        });

        if (res.status === 404) {
          res = await fetch("https://toppily.com/api/v1/check-console-balance", {
            method: "GET",
            headers: {
              "x-api-key": toppilyKey,
              "Content-Type": "application/json",
            },
          });
        }

        if (res.ok) {
          const data = await res.json();
          const balanceVal = data["Wallet Balance"];
          if (balanceVal !== undefined && balanceVal !== null) {
            toppilyBalance = {
              balance: Number(balanceVal),
            };
          }
        }
      } catch (err) {
        console.error("Error fetching Toppily balance:", err);
      }
    }

    return NextResponse.json({
      toppilyBalance,
      agentPortalBalance,
    });
  } catch (error: any) {
    console.error("Error in balances route:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
