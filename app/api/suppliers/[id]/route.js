import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import { findSupplier, errorResponse, pickSupplier } from "@/lib/suppliers";
import { NextResponse } from "next/server";

const notFound = () => NextResponse.json({ error: "Supplier not found" }, { status: 404 });

export async function GET(req, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await dbConnect();
        const supplier = await findSupplier(session, (await params).id);
        return supplier ? NextResponse.json(supplier) : notFound();
    } catch (error) {
        return errorResponse(error, "fetching supplier");
    }
}

export async function PUT(req, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const body = await req.json();
        await dbConnect();
        const supplier = await findSupplier(session, (await params).id);
        if (!supplier) return notFound();
        supplier.set(pickSupplier(body));
        await supplier.save();
        return NextResponse.json(supplier);
    } catch (error) {
        return errorResponse(error, "updating supplier");
    }
}

export async function DELETE(req, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await dbConnect();
        const supplier = await findSupplier(session, (await params).id);
        if (!supplier) return notFound();
        supplier.isActive = false;
        await supplier.save();
        return NextResponse.json({ message: "Supplier deleted successfully" });
    } catch (error) {
        return errorResponse(error, "deleting supplier");
    }
}
