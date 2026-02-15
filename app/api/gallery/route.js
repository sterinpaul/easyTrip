import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Gallery from "@/models/Gallery";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    // Fetch all for admin, or user specific?
    // "Gallery page shows places with options to add photos of places"
    // I'll filter by user for consistent scoping
    const query = {};
    if (session.user.role !== 'admin') {
      query.user = session.user.id;
    }

    const photos = await Gallery.find(query).sort({ createdAt: -1 });
    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Gallery Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await dbConnect();

    const photo = await Gallery.create({
      ...body,
      user: session.user.id,
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Gallery Create Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req) {
  // For delete, we usually need an ID. Since this route is /api/gallery, 
  // we strictly need /api/gallery/[id] for RESTful delete. 
  // But sometimes query params work: ?id=...
  // I will implement DELETE here via query param for simplicity, or create separate route [id].
  // Given previous pattern, I'll use query param to keep file count low, OR create [id] route.
  // Creating [id] route is cleaner. I'll make a separate file or handle query param here.
  // Actually, Next.js App Router conventions favor dynamic routes.
  // I'll create api/gallery/[id]/route.js for DELETE.
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
