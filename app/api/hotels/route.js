import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Hotel from "@/models/Hotel";
import "@/models/Image"; // Important: registers Image schema for population
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const search = searchParams.get("search") || "";
        const skip = (page - 1) * limit;

        const query = { isActive: true };

        if (session.user.role !== "admin") {
            query.createdBy = session.user.id;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { city: { $regex: search, $options: "i" } },
            ];
        }

        const hotels = await Hotel.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate({ path: "image", match: { isActive: true } });

        const total = await Hotel.countDocuments(query);

        return NextResponse.json({
            hotels,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total,
        });
    } catch (error) {
        console.error("Error fetching hotels:", error);
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
        await dbConnect();

        let imageId = null;
        if (body.image && body.image.url) {
            if (body.image._id) {
                imageId = body.image._id;
            } else {
                const Image = (await import("@/models/Image")).default;
                const imgDoc = await Image.create({
                    title: body.name || "Hotel Image",
                    url: body.image.url,
                    createdBy: session.user.id,
                });
                imageId = imgDoc._id;
            }
        }
        body.image = imageId;

        const hotel = await Hotel.create({
            ...body,
            createdBy: session.user.id,
        });

        return NextResponse.json(hotel, { status: 201 });
    } catch (error) {
        console.error("Error creating hotel:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((val) => val.message);
            return NextResponse.json({ error: "Validation Error", details: messages }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
