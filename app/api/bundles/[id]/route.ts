import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import Bundle from "@/models/Bundle";

// PATCH /api/bundles/[id] - Update a data bundle (Admin only)
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

    await dbConnect();

    // Recalculate sizeValue if name is changing
    if (body.name) {
      let sizeValue = 0;
      const match = body.name.match(/^([\d.]+)\s*(GB|MB)?$/i);
      if (match) {
        const val = parseFloat(match[1]);
        const unit = (match[2] || "GB").toUpperCase();
        sizeValue = unit === "GB" ? val * 1024 : val;
      }
      body.sizeValue = sizeValue;
    }

    const updatedBundle = await Bundle.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedBundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json(updatedBundle);
  } catch (error: any) {
    console.error("Error updating bundle:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/bundles/[id] - Delete a data bundle (Admin only)
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
    const deletedBundle = await Bundle.findByIdAndDelete(id);

    if (!deletedBundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Bundle deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting bundle:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
