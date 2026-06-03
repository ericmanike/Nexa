import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Bundle from "@/models/Bundle";

// GET /api/bundles - Returns all data bundles
export async function GET() {
  try {
    await dbConnect();
    const bundles = await Bundle.find({}).sort({ network: 1, price: 1 });
    return NextResponse.json(bundles);
  } catch (error: any) {
    console.error("Error fetching bundles:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// POST /api/bundles - Create a new data bundle (Admin only)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { network, name, price, isActive, audience } = await req.json();

    if (!network || !name || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Parse sizeValue in MB (e.g., "2GB" -> 2048, "500MB" -> 500)
    let sizeValue = 0;
    const match = name.match(/^([\d.]+)\s*(GB|MB)?$/i);
    if (match) {
      const val = parseFloat(match[1]);
      const unit = (match[2] || "GB").toUpperCase();
      sizeValue = unit === "GB" ? val * 1024 : val;
    }

    const newBundle = await Bundle.create({
      network,
      name,
      price,
      isActive: isActive !== undefined ? isActive : true,
      audience: audience || "user",
      sizeValue,
    });

    return NextResponse.json(newBundle);
  } catch (error: any) {
    console.error("Error creating bundle:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
