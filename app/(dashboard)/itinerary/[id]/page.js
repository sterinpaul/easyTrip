import ItineraryView from "@/components/itinerary/ItineraryView";
import dbConnect from "@/lib/db";
import Itinerary from "@/models/Itinerary";
import "@/models/Destination";
import "@/models/Transportation";
import "@/models/Client";
import "@/models/Image";
import "@/models/Hotel";
import { notFound } from "next/navigation";

export const metadata = {
  title: 'Travel Itinerary',
  description: 'Explore Travel Itinerary',
};

export default async function Page({ params }) {
  const { id } = await params;

  await dbConnect();

  const itinerary = await Itinerary.findOne({ _id: id, isActive: true })
    .populate({
      path: "destinations",
      match: { isActive: true },
      populate: [
        { path: "transportation.outbound", model: "Transportation", match: { isActive: true } },
        { path: "transportation.inbound", model: "Transportation", match: { isActive: true } },
        { path: "hotelDetails.hotels", model: "Hotel", match: { isActive: true } },
      ],
    })
    .populate({ path: "heroImage", match: { isActive: true }, select: "_id title url" })
    .populate({ path: "highlightImages", match: { isActive: true }, select: "_id title url" })
    .populate({ path: "client", match: { isActive: true } })
    .lean();

  if (!itinerary) {
    notFound();
  }

  // Serialize MongoDB ObjectIDs and dates for client component
  const serialized = JSON.parse(JSON.stringify(itinerary));

  return (
    <div className="flex flex-col gap-5">
      <ItineraryView itinerary={serialized} />
    </div>
  );
}