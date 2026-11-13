import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SupplierRate from "@/models/SupplierRate";
import { findSupplier, errorResponse, pickRate } from "@/lib/suppliers";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await dbConnect();
        const supplier = await findSupplier(session, (await params).id);
        if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
        const rates = await SupplierRate.find({ supplier: supplier._id }).sort({ packageName: 1, guests: 1, groupRate: 1 });
        return NextResponse.json({ rates });
    } catch (error) {
        return errorResponse(error, "fetching rates");
    }
}

export async function POST(req, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json();
        await dbConnect();
        const supplier = await findSupplier(session, (await params).id);
        if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });
        const rate = await SupplierRate.create({ ...pickRate(body), supplier: supplier._id, createdBy: session.user.id });
        return NextResponse.json(rate, { status: 201 });
    } catch (error) {
        return errorResponse(error, "creating rate");
    }
}
