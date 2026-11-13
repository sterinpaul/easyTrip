import { getSession } from "@/lib/auth";
import dbConnect from "@/lib/db";
import SupplierRate from "@/models/SupplierRate";
import { findSupplier, errorResponse } from "@/lib/suppliers";
import { parseRatesWorkbook } from "@/lib/rateImport";
import { NextResponse } from "next/server";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(req, { params }) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await dbConnect();
        const supplier = await findSupplier(session, (await params).id);
        if (!supplier) return NextResponse.json({ error: "Supplier not found" }, { status: 404 });

        const formData = await req.formData();
        const file = formData.get("file");
        const mode = formData.get("mode") === "replace" ? "replace" : "upsert";
        if (!file || typeof file === "string") return NextResponse.json({ error: "No file provided" }, { status: 400 });
        if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File size exceeds 5MB limit" }, { status: 400 });
        if (!file.name?.toLowerCase().endsWith(".xlsx")) return NextResponse.json({ error: "Only .xlsx files are supported" }, { status: 400 });

        let parsed;
        try {
            parsed = await parseRatesWorkbook(Buffer.from(await file.arrayBuffer()));
        } catch (e) {
            return NextResponse.json({ error: e.message || "Could not read the Excel file" }, { status: 400 });
        }

        // Last occurrence wins for duplicate keys inside the file
        const byKey = new Map(parsed.rows.map((r) => [`${r.packageName}|${r.guests}|${r.category}`, r]));
        const rows = [...byKey.values()];
        if (!rows.length) return NextResponse.json({ error: "No valid rate rows found", skipped: parsed.skipped }, { status: 400 });

        // Replace only after parsing succeeded, so a bad file never wipes existing rates
        if (mode === "replace") await SupplierRate.deleteMany({ supplier: supplier._id });

        const result = await SupplierRate.bulkWrite(
            rows.map((r) => ({
                updateOne: {
                    filter: { supplier: supplier._id, packageName: r.packageName, guests: r.guests, category: r.category },
                    update: {
                        $set: r.rooms === undefined ? { groupRate: r.groupRate } : { rooms: r.rooms, groupRate: r.groupRate },
                        $setOnInsert: { createdBy: session.user.id },
                    },
                    upsert: true,
                },
            }))
        );

        return NextResponse.json({
            sheet: parsed.sheet,
            mode,
            inserted: result.upsertedCount,
            updated: result.matchedCount,
            skipped: parsed.skipped,
        });
    } catch (error) {
        return errorResponse(error, "importing rates");
    }
}
