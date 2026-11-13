import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Supplier from "@/models/Supplier";
import { supplierScope, errorResponse, pickSupplier } from "@/lib/suppliers";
import { NextResponse } from "next/server";

export async function GET(req) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
        const limit = Math.min(200, Math.max(1, parseInt(searchParams.get("limit") || "10")));
        const search = (searchParams.get("search") || "").trim();

        const query = supplierScope(session);
        if (search) {
            const rx = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
            query.$or = [{ name: rx }, { destination: rx }];
        }

        const [suppliers, total] = await Promise.all([
            Supplier.find(query).sort({ name: 1 }).skip((page - 1) * limit).limit(limit),
            Supplier.countDocuments(query),
        ]);

        return NextResponse.json({ suppliers, totalPages: Math.ceil(total / limit), currentPage: page, total });
    } catch (error) {
        return errorResponse(error, "fetching suppliers");
    }
}

export async function POST(req) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        await dbConnect();
        const supplier = await Supplier.create({ ...pickSupplier(body), createdBy: session.user.id });
        return NextResponse.json(supplier, { status: 201 });
    } catch (error) {
        return errorResponse(error, "creating supplier");
    }
}
