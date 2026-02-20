import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import LocationImage from "@/models/LocationImage";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const result = await LocationImage.findOneAndDelete({ _id: id, user: session.user.role === 'admin' ? { $exists: true } : session.user.id });

    if (!result) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("LocationImage Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
