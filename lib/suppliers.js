import Supplier from "@/models/Supplier";
import { NextResponse } from "next/server";

// Same scoping as hotels: admins see all, others only their own.
export function supplierScope(session, extra = {}) {
    const q = { isActive: true, ...extra };
    if (session.user.role !== "admin") q.createdBy = session.user.id;
    return q;
}

export async function findSupplier(session, id) {
    try {
        return await Supplier.findOne(supplierScope(session, { _id: id }));
    } catch {
        return null; // invalid ObjectId
    }
}

export function errorResponse(error, label) {
    console.error(`Error ${label}:`, error);
    if (error.name === "ValidationError") {
        const details = Object.values(error.errors).map((e) => e.message);
        return NextResponse.json({ error: "Validation Error", details }, { status: 400 });
    }
    if (error.code === 11000) {
        return NextResponse.json({ error: "A rate for this package, guests and category already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}

const FIELDS = ["name", "destination", "contactName", "phone", "email", "currency", "notes"];
export const pickSupplier = (body) => Object.fromEntries(FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));

const RATE_FIELDS = ["packageName", "guests", "rooms", "category", "groupRate"];
export const pickRate = (body) => Object.fromEntries(RATE_FIELDS.filter((k) => k in body).map((k) => [k, body[k]]));
