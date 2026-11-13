import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SupplierRate from "@/models/SupplierRate";
import { findSupplier, errorResponse, pickRate } from "@/lib/suppliers";
import { NextResponse } from "next/server";

async function load(session, params) {
    const { id, rateId } = await params;
    const supplier = await findSupplier(session, id);
    if (!supplier) return null;
    try {
        return await SupplierRate.findOne({ _id: rateId, supplier: supplier._id });
    } catch {
        return null;
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json();
        await dbConnect();
        const rate = await load(session, params);
        if (!rate) return NextResponse.json({ error: "Rate not found" }, { status: 404 });
        rate.set(pickRate(body));
        await rate.save();
        return NextResponse.json(rate);
    } catch (error) {
        return errorResponse(error, "updating rate");
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await dbConnect();
        const rate = await load(session, params);
        if (!rate) return NextResponse.json({ error: "Rate not found" }, { status: 404 });
        await rate.deleteOne();
        return NextResponse.json({ message: "Rate deleted successfully" });
    } catch (error) {
        return errorResponse(error, "deleting rate");
    }
}
