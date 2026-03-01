import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Hotel from "@/models/Hotel";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        const { id } = await params;
        const hotel = await Hotel.findOne({ _id: id, isActive: true }).populate({ path: "image", match: { isActive: true } });

        if (!hotel) {
            return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
        }

        return NextResponse.json(hotel);
    } catch (error) {
        console.error("Error fetching hotel:", error);
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
        await dbConnect();

        let imageId = undefined;
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
        } else if (body.image === null) {
            imageId = null;
        }

        if (imageId !== undefined) {
            body.image = imageId;
        } else {
            delete body.image;
        }

        const hotel = await Hotel.findOneAndUpdate({ _id: id, isActive: true }, body, { new: true, runValidators: true }).populate({ path: "image", match: { isActive: true } });

        if (!hotel) {
            return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
        }

        return NextResponse.json(hotel);
    } catch (error) {
        console.error("Error updating hotel:", error);
        if (error.name === "ValidationError") {
            const messages = Object.values(error.errors).map((val) => val.message);
            return NextResponse.json({ error: "Validation Error", details: messages }, { status: 400 });
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

        const hotel = await Hotel.findOneAndUpdate({ _id: id, isActive: true }, { isActive: false }, { new: true });

        if (!hotel) {
            return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
        }

        return NextResponse.json({ message: "Hotel deleted successfully" });
    } catch (error) {
        console.error("Error deleting hotel:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
