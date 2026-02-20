import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Itinerary from "@/models/Itinerary";
import Destination from "@/models/Destination";
import LocationImage from "@/models/LocationImage";
import Transportation from "@/models/Transportation";
import "@/models/Client";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "upcoming";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    let matchStage = { isActive: true };

    if (status === 'upcoming') {
      matchStage.status = 'saved';
      matchStage.startDate = { $gte: new Date() };
    } else if (status === 'past') {
      matchStage.status = 'saved';
      matchStage.endDate = { $lt: new Date() };
    } else if (status === 'saved') {
      matchStage.status = 'saved';
    } else {
      if (status) matchStage.status = status;
    }

    if (session.user.role !== 'admin') {
      matchStage.createdBy = new mongoose.Types.ObjectId(session.user.id);
    }

    const itineraries = await Itinerary.aggregate([
      { $match: matchStage },
      { $sort: { startDate: 1 } },
      { $skip: skip },
      { $limit: limit },
      // Lookup Client
      {
        $lookup: {
          from: "users", // Assuming 'client' refers to User model or Client model? Itinerary schema says ref: 'Client'. 
          // Check Itinerary.js schema import: import "@/models/Client". Model is "Client". Collection "clients".
          from: "clients",
          localField: "client",
          foreignField: "_id",
          as: "client"
        }
      },
      { $unwind: { path: "$client", preserveNullAndEmptyArrays: true } },
      // Lookup Destinations
      {
        $lookup: {
          from: "destinations",
          localField: "destinations",
          foreignField: "_id",
          as: "destinationsData"
        }
      },
      // Map destinations to preserve order
      {
        $addFields: {
          destinations: {
            $map: {
              input: { $ifNull: ["$destinations", []] },
              as: "destId",
              in: {
                $arrayElemAt: [
                  {
                    $filter: {
                      input: "$destinationsData",
                      as: "d",
                      cond: { $eq: ["$$d._id", "$$destId"] }
                    }
                  },
                  0
                ]
              }
            }
          }
        }
      },
      // Remove raw lookup data
      { $project: { destinationsData: 0 } },
      // Unwind to lookup images
      { $unwind: { path: "$destinations", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "locationimages",
          localField: "destinations.image",
          foreignField: "_id",
          as: "destinations.image"
        }
      },
      { $unwind: { path: "$destinations.image", preserveNullAndEmptyArrays: true } },
      // Group back
      {
        $group: {
          _id: "$_id",
          root: { $first: "$$ROOT" },
          destinations: { $push: "$destinations" }
        }
      },
      // Merge destinations back into root
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: ["$root.root", { destinations: { $filter: { input: "$destinations", as: "d", cond: { $ne: ["$$d", {}] } } } }]
            // Note: $unwind on null preserves empty object or null. Check output.
            // If destinations was empty, unwind/group might result in [null] or [{}].
            // Safe bet is to filter empty if needed. Or accept it.
          }
        }
      },
      // Ensure destinations is array if it was null (unwind preserved null)
      {
        $addFields: {
          destinations: {
            $cond: {
              if: { $eq: [{ $type: "$destinations" }, "array"] },
              then: {
                $filter: {
                  input: "$destinations",
                  as: "d",
                  cond: { $and: [{ $ne: ["$$d", null] }, { $ne: ["$$d", {}] }] }
                }
              },
              else: []
            }
          }
        }
      }
    ]);

    const total = await Itinerary.countDocuments(matchStage);

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
    console.log("POST Body:", JSON.stringify(body, null, 2));
    const userId = session.user.id;

    // Handle optional ObjectId fields
    if (body.client === "") {
      body.client = null;
    }

    await dbConnect();

    // ── 1. Create Destination documents (with optional LocationImage) ──
    const destinationIds = [];

    if (body.destinations && Array.isArray(body.destinations)) {
      for (const dest of body.destinations) {
        let imageId = null;

        // Handle Image
        if (dest.image && dest.image.url) {
          if (dest.image._id) {
            // Reuse existing image
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

        // Create Destination document
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

    // ── 2. Create Transportation documents ──
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

    // ── 3. Create the Itinerary ──
    const itinerary = await Itinerary.create({
      title: body.title,
      client: body.client || undefined,
      travelFrom: body.travelFrom,
      travelTo: body.travelTo,
      startDate: body.startDate,
      endDate: body.endDate,
      description: body.description || "",
      totalCost: body.totalCost || 0,
      notes: body.notes || "",
      destinations: destinationIds,
      transportation,
      status: body.status || "draft",
      isActive: true,
      createdBy: userId,
    });

    return NextResponse.json(itinerary, { status: 201 });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return NextResponse.json({ error: "Validation Error", details: messages }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
