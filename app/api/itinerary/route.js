import { auth } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Itinerary from "@/models/Itinerary";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "upcoming";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filter by status if provided, otherwise return all
    // Also ensuring user only sees their own itineraries (if strictly needed, but admin sees all? 
    // Prompt says "only the email in database can access the dashboard". Assuming they are admin.)
    // But logically, itineraries usually belong to the creator or business.
    // I will filter by user mostly, but user is admin.
    const query = { status };
    if (session.user.role !== 'admin') {
         query.user = session.user.id;
    }

    const itineraries = await Itinerary.find(query)
      .sort({ startDate: 1 }) // Closest first
      .skip(skip)
      .limit(limit)
      .populate("client", "name email");

    const total = await Itinerary.countDocuments(query);

    return NextResponse.json({
      itineraries,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    await dbConnect();

    const itinerary = await Itinerary.create({
      ...body,
      user: session.user.id,
    });

    return NextResponse.json(itinerary, { status: 201 });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
