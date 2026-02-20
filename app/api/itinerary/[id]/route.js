import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Itinerary from "@/models/Itinerary";
import Destination from "@/models/Destination";
import LocationImage from "@/models/LocationImage";
import Transportation from "@/models/Transportation";
import "@/models/Client";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;

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
            .populate("client");

        if (!itinerary) {
            return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
        }

        return NextResponse.json(itinerary);
    } catch (error) {
        console.error("Error fetching itinerary:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const body = await req.json();
        console.log("PUT Body:", JSON.stringify(body, null, 2));
        const userId = session.user.id;

        await dbConnect();

        const existingItinerary = await Itinerary.findById(id);
        if (!existingItinerary) {
            return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
        }

        // 1. Create new nested documents (Destinations)
        const destinationIds = [];
        if (body.destinations && Array.isArray(body.destinations)) {
            for (const dest of body.destinations) {
                let imageId = null;

                // Handle Image
                if (dest.image && dest.image.url) {
                    if (dest.image._id) {
                        // Use existing image if ID provided
                        imageId = dest.image._id;
                    } else {
                        // Create new LocationImage
                        const locationImage = await LocationImage.create({
                            title: dest.image.title || dest.name,
                            description: dest.image.description || "",
                            url: dest.image.url,
                            createdBy: userId,
                        });
                        imageId = locationImage._id;
                    }
                }

                const destination = await Destination.create({
                    name: dest.name,
                    description: dest.description || "",
                    image: imageId,
                    activities: (dest.activities || []).map((act) => ({
                        day: act.day,
                        date: act.date || undefined,
                        description: act.description || "",
                        time: { from: act.time?.from || "", to: act.time?.to || "" },
                    })),
                    createdBy: userId,
                });
                destinationIds.push(destination._id);
            }
        }

        // 2. Create new Transportation documents
        const transportation = {};
        for (const direction of ["inbound", "outbound"]) {
            const t = body.transportation?.[direction];
            if (t && (t.from || t.to || t.mode)) {
                const transportDoc = await Transportation.create({
                    mode: t.mode || undefined,
                    from: t.from,
                    to: t.to,
                    departureTime: t.departureTime || undefined,
                    arrivalTime: t.arrivalTime || undefined,
                    vehicleDetails: t.vehicleDetails || "",
                    createdBy: userId,
                });
                transportation[direction] = transportDoc._id;
            }
        }

        // 3. Update Itinerary
        await Itinerary.findByIdAndUpdate(
            id,
            {
                title: body.title,
                client: body.client || null,
                travelFrom: body.travelFrom,
                travelTo: body.travelTo,
                startDate: body.startDate,
                endDate: body.endDate,
                description: body.description || "",
                totalCost: body.totalCost || 0,
                notes: body.notes || "",
                destinations: destinationIds,
                transportation: transportation,
                status: body.status || "draft",
                isActive: true,
            },
            { new: true }
        );

        // 4. Cleanup old nested documents (AFTER successful update)
        if (existingItinerary.destinations && existingItinerary.destinations.length > 0) {
            await Destination.deleteMany({ _id: { $in: existingItinerary.destinations } });
        }
        if (existingItinerary.transportation) {
            const transportIds = [];
            if (existingItinerary.transportation.inbound) transportIds.push(existingItinerary.transportation.inbound);
            if (existingItinerary.transportation.outbound) transportIds.push(existingItinerary.transportation.outbound);
            if (transportIds.length > 0) {
                await Transportation.deleteMany({ _id: { $in: transportIds } });
            }
        }

        // Fetch populated data to return
        const finalItinerary = await Itinerary.findById(id)
            .populate({
                path: "destinations",
                populate: {
                    path: "image",
                    model: "LocationImage",
                },
            })
            .populate("transportation.inbound")
            .populate("transportation.outbound")
            .populate("client");

        return NextResponse.json(finalItinerary);
    } catch (error) {
        console.error("Error updating itinerary:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const itinerary = await Itinerary.findById(id);
        if (!itinerary) {
            return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
        }

        // Cleanup nested
        if (itinerary.destinations && itinerary.destinations.length > 0) {
            await Destination.deleteMany({ _id: { $in: itinerary.destinations } });
        }
        if (itinerary.transportation) {
            const transportIds = [];
            if (itinerary.transportation.inbound) transportIds.push(itinerary.transportation.inbound);
            if (itinerary.transportation.outbound) transportIds.push(itinerary.transportation.outbound);
            if (transportIds.length > 0) {
                await Transportation.deleteMany({ _id: { $in: transportIds } });
            }
        }

        await Itinerary.findByIdAndDelete(id);

        return NextResponse.json({ message: "Itinerary deleted successfully" });
    } catch (error) {
        console.error("Error deleting itinerary:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
