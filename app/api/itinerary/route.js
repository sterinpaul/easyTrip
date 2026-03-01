import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Itinerary from "@/models/Itinerary";
import Destination from "@/models/Destination";
import Image from "@/models/Image";
import Transportation from "@/models/Transportation";
import Hotel from "@/models/Hotel";
import "@/models/Client";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const packageId = searchParams.get("packageId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let query = { isActive: true };

    // Package ID search (for debounced search in form)
    if (packageId) {
      query.packageId = { $regex: packageId, $options: "i" };
    }

    if (status === "upcoming") {
      query.startDate = { $gte: new Date() };
    } else if (status === "past") {
      query.endDate = { $lt: new Date() };
    }

    if (session.user.role !== "admin") {
      query.createdBy = new mongoose.Types.ObjectId(session.user.id);
    }

    const itineraries = await Itinerary.find(query)
      .select("title packageId startDate endDate category type totalCost guestCount client destinations")
      .populate({ path: "client", match: { isActive: true }, select: "name" })
      .populate({ path: "destinations", match: { isActive: true }, select: "name" })
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit);

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
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const userId = session.user.id;

    if (body.packageId) {
      const existingPackage = await Itinerary.findOne({ packageId: body.packageId, isActive: true });
      if (existingPackage) {
        return NextResponse.json({ error: "Validation Error", details: ["Package ID already exists"] }, { status: 400 });
      }
    }

    if (body.client === "") body.client = null;

    await dbConnect();

    // ── 1. Create Destination documents ──
    const destinationIds = [];

    if (body.destinations && Array.isArray(body.destinations)) {
      for (const dest of body.destinations) {
        // Handle per-destination transportation
        const transportation = {};
        for (const direction of ["outbound", "inbound"]) {
          const t = dest.transportation?.[direction];
          if (t && (t.from || t.to || t.mode)) {
            const transportDoc = await Transportation.create({
              mode: t.mode || undefined,
              from: t.from,
              to: t.to,
              departureTime: t.departureTime || undefined,
              arrivalTime: t.arrivalTime || undefined,
              vehicleDetails: t.vehicleDetails || "",
              notes: t.notes || "",
              createdBy: userId,
            });
            transportation[direction] = transportDoc._id;
          }
        }

        // Create Destination document
        const destination = await Destination.create({
          name: dest.name,
          description: dest.description || "",
          transportation,
          hotelDetails: (dest.hotelDetails || []).map(ht => ({
            type: ht.type || "STANDARD",
            isSelected: ht.isSelected || false,
            hotels: (ht.hotels || []).map(h => typeof h === 'object' ? h._id : h),
          })),
          itinerary: (dest.itinerary || []).map(item => ({
            day: item.day,
            title: item.title || "",
            activities: (item.activities || []).map(act => ({
              activity: act.activity || "",
              subActivities: (act.subActivities || []).filter(s => typeof s === 'string' && s.trim())
            })).filter(act => act.activity),
          })),
          isActive: true,
          createdBy: userId,
        });

        destinationIds.push(destination._id);
      }
    }

    // ── 2. Create the Itinerary ──
    const itinerary = await Itinerary.create({
      title: body.title,
      packageId: body.packageId,
      client: body.client || undefined,
      guestCount: body.guestCount,
      departureFrom: body.departureFrom,
      arrivalAt: body.arrivalAt,
      startDate: body.startDate,
      endDate: body.endDate,
      duration: body.duration,
      category: body.category,
      type: body.type,
      totalCost: body.totalCost || 0,
      rewardPoints: body.rewardPoints || 0,
      rewardPercentage: body.rewardPercentage || 0,
      notes: body.notes || "",
      transportationModes: body.transportationModes || [],
      includes: body.includes || [],
      excludes: body.excludes || [],
      heroImage: body.heroImage?._id || undefined,
      highlightImages: (body.highlightImages || []).map(img => img._id),
      destinations: destinationIds,
      isActive: true,
      createdBy: userId,
    });

    return NextResponse.json(itinerary, { status: 201 });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return NextResponse.json({ error: "Validation Error", details: messages }, { status: 400 });
    }
    if (error.name === "CastError") {
      return NextResponse.json({ error: "Invalid ID Format", details: [`Invalid format for field ${error.path}`] }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
