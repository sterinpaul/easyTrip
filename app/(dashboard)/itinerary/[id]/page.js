import ItineraryForm from "@/components/itinerary/ItineraryForm";
import dbConnect from "@/lib/db";
import Itinerary from "@/models/Itinerary";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function EditItineraryPage({ params }) {
  const { id } = await params;
  const session = await getSession();

  await dbConnect();

  // Find itinerary and check ownership if needed
  const itinerary = await Itinerary.findById(id).lean();

  if (!itinerary) {
    notFound();
  }

  // Convert _id to string for serialization
  const serializedItinerary = {
    ...itinerary,
    _id: itinerary._id.toString(),
    client: itinerary.client ? itinerary.client.toString() : "",
    user: itinerary.user.toString(),
    startDate: itinerary.startDate.toISOString().split("T")[0],
    endDate: itinerary.endDate.toISOString().split("T")[0],
    activities: itinerary.activities.map(a => ({
      ...a,
      _id: a._id ? a._id.toString() : undefined,
      date: a.date ? a.date.toISOString() : undefined
    })),
    createdAt: itinerary.createdAt.toISOString(),
    updatedAt: itinerary.updatedAt.toISOString(),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">Edit Itinerary</h1>
      </div>
      <ItineraryForm initialData={serializedItinerary} />
    </div>
  );
}
