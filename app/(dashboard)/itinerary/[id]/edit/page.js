import ItineraryForm from "@/components/itinerary/ItineraryForm";
import dbConnect from "@/lib/db";
import Itinerary from "@/models/Itinerary";
import "@/models/Destination";
import "@/models/Transportation";
import "@/models/Client";
import "@/models/LocationImage";
import { notFound } from "next/navigation";

export default async function EditItineraryPage({ params }) {
    const { id } = await params;

    await dbConnect();

    // Find itinerary and populate all nested fields
    const itinerary = await Itinerary.findById(id)
        .populate({
            path: "destinations",
            populate: {
                path: "image",
                model: "LocationImage",
            },
        })
        .populate("transportation.inbound")
        .populate("transportation.outbound")
        .populate("client")
        .lean();

    if (!itinerary) {
        notFound();
    }

    // Serializable object for client component
    const serializedItinerary = {
        _id: itinerary._id.toString(),
        title: itinerary.title,
        client: itinerary.client ? itinerary.client._id.toString() : "",
        travelFrom: itinerary.travelFrom,
        travelTo: itinerary.travelTo,
        startDate: itinerary.startDate ? itinerary.startDate.toISOString().split("T")[0] : "",
        endDate: itinerary.endDate ? itinerary.endDate.toISOString().split("T")[0] : "",
        description: itinerary.description || "",
        totalCost: itinerary.totalCost || 0,
        notes: itinerary.notes || "",
        status: itinerary.status,
        isActive: itinerary.isActive,

        // Nested Destinations
        destinations: (itinerary.destinations || []).map(dest => ({
            _id: dest._id.toString(),
            name: dest.name,
            description: dest.description || "",
            image: dest.image ? {
                _id: dest.image._id.toString(),
                url: dest.image.url,
                title: dest.image.title || "",
                description: dest.image.description || ""
            } : { url: "", title: "", description: "" },
            activities: (dest.activities || []).map(act => ({
                day: act.day,
                date: act.date ? act.date.toISOString().split("T")[0] : "",
                description: act.description || "",
                time: {
                    from: act.time?.from || "",
                    to: act.time?.to || ""
                }
            }))
        })),

        // Transportation
        transportation: {
            inbound: itinerary.transportation?.inbound ? {
                ...itinerary.transportation.inbound,
                _id: itinerary.transportation.inbound._id.toString(),
                departureTime: itinerary.transportation.inbound.departureTime ? itinerary.transportation.inbound.departureTime.toISOString() : "",
                arrivalTime: itinerary.transportation.inbound.arrivalTime ? itinerary.transportation.inbound.arrivalTime.toISOString() : "",
            } : { mode: "", from: "", to: "", departureTime: "", arrivalTime: "", vehicleDetails: "" },
            outbound: itinerary.transportation?.outbound ? {
                ...itinerary.transportation.outbound,
                _id: itinerary.transportation.outbound._id.toString(),
                departureTime: itinerary.transportation.outbound.departureTime ? itinerary.transportation.outbound.departureTime.toISOString() : "",
                arrivalTime: itinerary.transportation.outbound.arrivalTime ? itinerary.transportation.outbound.arrivalTime.toISOString() : "",
            } : { mode: "", from: "", to: "", departureTime: "", arrivalTime: "", vehicleDetails: "" }
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Edit Itinerary</h1>
            </div>
            <ItineraryForm initialData={serializedItinerary} />
        </div>
    );
}
