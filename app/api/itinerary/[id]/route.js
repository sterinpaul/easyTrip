import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Itinerary from "@/models/Itinerary";
import Destination from "@/models/Destination";
import Image from "@/models/Image";
import Transportation from "@/models/Transportation";
import Hotel from "@/models/Hotel";
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
            .populate({ path: "client", match: { isActive: true } });

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
        const userId = session.user.id;

        if (body.packageId) {
            const existingPackage = await Itinerary.findOne({ packageId: body.packageId, _id: { $ne: id }, isActive: true });
            if (existingPackage) {
                return NextResponse.json({ error: "Validation Error", details: ["Package ID already exists"] }, { status: 400 });
            }
        }

        await dbConnect();

        const existingItinerary = await Itinerary.findOne({ _id: id, isActive: true });
        if (!existingItinerary) {
            return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
        }

        // 1. Create new Destination documents
        const destinationIds = [];
        if (body.destinations && Array.isArray(body.destinations)) {
            for (const dest of body.destinations) {
                // Per-destination transportation
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

        // 2. Update Itinerary
        await Itinerary.findByIdAndUpdate(
            id,
            {
                title: body.title,
                packageId: body.packageId,
                client: body.client || null,
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
                heroImage: body.heroImage?._id || null, // null removes the image if it was deleted
                highlightImages: (body.highlightImages || []).map(img => img._id),
                destinations: destinationIds,
                isActive: true,
            },
            { new: true }
        );

        // 3. Cleanup old destinations and their transportation docs
        if (existingItinerary.destinations && existingItinerary.destinations.length > 0) {
            // Fetch old destinations to get their transportation refs
            const oldDests = await Destination.find({ _id: { $in: existingItinerary.destinations } });
            const transportIds = [];
            for (const d of oldDests) {
                if (d.transportation?.outbound) transportIds.push(d.transportation.outbound);
                if (d.transportation?.inbound) transportIds.push(d.transportation.inbound);
            }
            if (transportIds.length > 0) {
                await Transportation.deleteMany({ _id: { $in: transportIds } });
            }
            await Destination.deleteMany({ _id: { $in: existingItinerary.destinations } });
        }

        // Fetch populated data to return
        const finalItinerary = await Itinerary.findOne({ _id: id, isActive: true })
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
            .populate({ path: "client", match: { isActive: true } });

        return NextResponse.json(finalItinerary);
    } catch (error) {
        console.error("Error updating itinerary:", error);
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

export async function DELETE(req, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        await dbConnect();

        const itinerary = await Itinerary.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true });
        if (!itinerary) {
            return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
        }

        // Soft-delete associated destinations
        if (itinerary.destinations && itinerary.destinations.length > 0) {
            await Destination.updateMany(
                { _id: { $in: itinerary.destinations } },
                { isActive: false }
            );
        }

        return NextResponse.json({ message: "Itinerary deleted successfully" });
    } catch (error) {
        console.error("Error deleting itinerary:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
