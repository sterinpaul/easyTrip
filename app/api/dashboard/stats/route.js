import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
import Itinerary from "@/models/Itinerary";
import Hotel from "@/models/Hotel";

export async function GET() {
  try {
    await dbConnect();

    const totalClients = await Client.countDocuments({ isActive: true });
    const totalItineraries = await Itinerary.countDocuments({ isActive: true });
    const totalHotels = await Hotel.countDocuments({ isActive: true });
    const upcomingTrips = await Itinerary.countDocuments({
      isActive: true,
      startDate: { $gte: new Date() },
    });
    const pastTrips = await Itinerary.countDocuments({
      isActive: true,
      endDate: { $lt: new Date() },
    });

    return NextResponse.json({
      totalClients,
      totalItineraries,
      totalHotels,
      upcomingTrips,
      pastTrips,
    });
  } catch (error) {
    console.error("Dashboard Stats Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
