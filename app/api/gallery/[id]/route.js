import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Image from "@/models/Image";
import { NextResponse } from "next/server";

export async function DELETE(req, { params }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await dbConnect();

    const query = { _id: id, isActive: true };
    if (session.user.role !== 'admin') {
      query.createdBy = session.user.id;
    }

    const result = await Image.findOneAndUpdate(query, { isActive: false }, { new: true });

    if (!result) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Image Delete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
