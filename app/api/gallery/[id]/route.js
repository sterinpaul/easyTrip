import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Gallery from "@/models/Gallery";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const result = await Gallery.findOneAndDelete({ _id: id, user: session.user.role === 'admin' ? { $exists: true } : session.user.id });

    if (!result) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gallery Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
