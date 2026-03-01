import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Image from "@/models/Image";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    // Fetch all for admin, or user specific?
    // "Gallery page shows places with options to add photos of places"
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const limitParams = searchParams.get("limit");

    const query = { isActive: true };
    if (session.user.role !== 'admin') {
      query.createdBy = session.user.id;
    }
    if (category && category !== 'all') {
      query.category = category;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    let photosQuery = Image.find(query).sort({ createdAt: -1 });
    if (limitParams) {
      photosQuery = photosQuery.limit(parseInt(limitParams));
    }

    const photos = await photosQuery;
    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Image Fetch Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    await dbConnect();

    const photo = await Image.create({
      title: body.title,
      url: body.url,
      category: body.category || "destinations", // Default to destinations as requested
      createdBy: session.user.id,
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Image Create Error:", error);
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
