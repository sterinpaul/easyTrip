import ItineraryForm from "@/components/itinerary/ItineraryForm";
import dbConnect from "@/lib/db";
import Itinerary from "@/models/Itinerary";
import "@/models/Destination";
import "@/models/Transportation";
import "@/models/Client";
import "@/models/Image";
import "@/models/Hotel";
import { notFound } from "next/navigation";

export default async function EditItineraryPage({ params }) {
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

    const serializeTransport = (t) => {
        if (!t) return { mode: "", from: "", to: "", departureTime: "", arrivalTime: "", vehicleDetails: "", notes: "" };
        return {
            _id: t._id?.toString(),
            mode: t.mode || "",
            from: t.from || "",
            to: t.to || "",
            departureTime: t.departureTime ? new Date(t.departureTime).toISOString().slice(0, 16) : "",
            arrivalTime: t.arrivalTime ? new Date(t.arrivalTime).toISOString().slice(0, 16) : "",
            vehicleDetails: t.vehicleDetails || "",
            notes: t.notes || "",
        };
    };

    const serializedItinerary = {
        _id: itinerary._id.toString(),
        title: itinerary.title,
        packageId: itinerary.packageId || "",
        client: itinerary.client ? {
            _id: itinerary.client._id.toString(),
            name: itinerary.client.name,
            email: itinerary.client.email
        } : null,
        guestCount: {
            adults: itinerary.guestCount?.adults || 1,
            children: itinerary.guestCount?.children || 0,
            infants: itinerary.guestCount?.infants || 0,
        },
        departureFrom: itinerary.departureFrom || "",
        arrivalAt: itinerary.arrivalAt || "",
        startDate: itinerary.startDate ? new Date(itinerary.startDate).toISOString().split("T")[0] : "",
        endDate: itinerary.endDate ? new Date(itinerary.endDate).toISOString().split("T")[0] : "",
        duration: {
            days: itinerary.duration?.days || 0,
            nights: itinerary.duration?.nights || 0,
        },
        category: itinerary.category || "FAMILY",
        type: itinerary.type || "STANDARD",
        totalCost: itinerary.totalCost || 0,
        rewardPoints: itinerary.rewardPoints || 0,
        rewardPercentage: itinerary.rewardPercentage || 0,
        notes: itinerary.notes || "",
        transportationModes: itinerary.transportationModes || [],
        includes: itinerary.includes || [""],
        excludes: itinerary.excludes || [""],
        isActive: itinerary.isActive,
        heroImage: itinerary.heroImage ? {
            _id: itinerary.heroImage._id.toString(),
            title: itinerary.heroImage.title || "",
            url: itinerary.heroImage.url || ""
        } : null,
        highlightImages: (itinerary.highlightImages || []).map(img => ({
            _id: img._id.toString(),
            title: img.title || "",
            url: img.url || ""
        })),

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
            transportation: {
                outbound: serializeTransport(dest.transportation?.outbound),
                inbound: serializeTransport(dest.transportation?.inbound),
            },
            hotelDetails: (dest.hotelDetails || []).map(ht => ({
                type: ht.type || "STANDARD",
                isSelected: ht.isSelected || false,
                hotels: (ht.hotels || []).map(h => {
                    if (typeof h === "object") {
                        return {
                            _id: h._id.toString(),
                            name: h.name || "",
                            city: h.city || ""
                        };
                    }
                    return h.toString();
                }),
            })),
            itinerary: (dest.itinerary || []).flatMap(item =>
                (item.activities || []).map(act => ({
                    day: item.day,
                    title: item.title || "",
                    activity: act.activity || "",
                    subActivities: act.subActivities || []
                }))
            ),
        })),
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
