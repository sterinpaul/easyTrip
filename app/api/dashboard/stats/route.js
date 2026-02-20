import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
import Itinerary from "@/models/Itinerary";

export async function GET() {
  try {
    await dbConnect();

    const totalClients = await Client.countDocuments();
    const totalItineraries = await Itinerary.countDocuments({ isActive: true });
    const upcomingTrips = await Itinerary.countDocuments({
      status: 'saved',
      isActive: true,
      startDate: { $gte: new Date() },
    });
    const pastTrips = await Itinerary.countDocuments({
      status: 'saved',
      isActive: true,
      endDate: { $lt: new Date() },
    });

    return NextResponse.json({
      totalClients,
      totalItineraries,
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
