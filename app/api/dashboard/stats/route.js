import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Client from "@/models/Client";
import Itinerary from "@/models/Itinerary";

export async function GET() {
  try {
    await dbConnect();

    const totalClients = await Client.countDocuments();
    const totalItineraries = await Itinerary.countDocuments();
    const upcomingTrips = await Itinerary.countDocuments({
      startDate: { $gte: new Date() },
    });
    const pastTrips = await Itinerary.countDocuments({
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
