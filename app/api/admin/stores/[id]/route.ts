import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import AgentStore from "@/models/AgentStore";
import StoreBundle from "@/models/StoreBundle";
import Order from "@/models/Order";
import User from "@/models/User";
import Bundle from "@/models/Bundle";

// GET /api/admin/stores/[id] - Fetch detailed store info (Admin only)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const store = await AgentStore.findById(id).populate(
      "user",
      "name email phone role walletBalance referralCode createdAt"
    );

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    const agentId = (store.user as any)?._id || store.user;

    // Fetch custom pricing configured by this agent
    const storeBundles = await StoreBundle.find({ agent: agentId }).populate("bundle");

    // Fetch recent orders placed through this agent's store
    const recentOrders = await Order.find({ agent: agentId })
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      store,
      storeBundles,
      recentOrders,
    });
  } catch (error: any) {
    console.error("Error fetching agent store details:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/admin/stores/[id] - Update store details or status (Admin only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { storeName, slug, description, whatsappSupport, isActive } = body;

    await dbConnect();

    const store = await AgentStore.findById(id);
    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    // If slug is changing, verify uniqueness
    if (slug !== undefined && slug.trim().toLowerCase() !== store.slug) {
      const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
      const existing = await AgentStore.findOne({
        slug: cleanSlug,
        _id: { $ne: id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Store slug is already in use by another store." },
          { status: 400 }
        );
      }
      store.slug = cleanSlug;
    }

    if (storeName !== undefined) store.storeName = storeName.trim();
    if (description !== undefined) store.description = description.trim();
    if (whatsappSupport !== undefined) store.whatsappSupport = whatsappSupport.trim();
    if (isActive !== undefined) store.isActive = Boolean(isActive);

    await store.save();
    await store.populate("user", "name email phone role walletBalance");

    return NextResponse.json({
      message: "Store updated successfully",
      store,
    });
  } catch (error: any) {
    console.error("Error updating agent store:", error);
    return NextResponse.json({ error: error.message || "Server error" }, { status: 500 });
  }
}

// DELETE /api/admin/stores/[id] - Delete an agent store (Admin only)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await dbConnect();

    const deletedStore = await AgentStore.findByIdAndDelete(id);
    if (!deletedStore) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Store deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting agent store:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
