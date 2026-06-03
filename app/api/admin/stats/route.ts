import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import Order from "@/models/Order";

// GET /api/admin/stats - Get platform statistics (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const usersCount = await User.countDocuments({});
    const ordersCount = await Order.countDocuments({});

    const salesAggregation = await Order.aggregate([
      { $match: { status: { $in: ["delivered", "completed"] } } },
      { $group: { _id: null, total: { $sum: "$price" } } },
    ]);
    const sales = salesAggregation.length > 0 ? salesAggregation[0].total : 0;

    return NextResponse.json({
      users: usersCount,
      orders: ordersCount,
      sales: sales,
    });
  } catch (error: any) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
