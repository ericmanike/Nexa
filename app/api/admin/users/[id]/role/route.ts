import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

// PATCH /api/admin/users/[id]/role - Update user role (Admin only)
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
    const { role } = await req.json();

    if (!role || !["user", "agent", "admin", "moderator"].includes(role)) {
      return NextResponse.json({ error: "Invalid role value" }, { status: 400 });
    }

    // Prevent admin from demoting or changing their own role
    if (id === (session.user as any).id) {
      return NextResponse.json({ error: "You cannot change your own role" }, { status: 400 });
    }

    await dbConnect();
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Role updated successfully",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Error updating user role:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
