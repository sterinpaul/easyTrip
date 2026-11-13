import mongoose from "mongoose";

const SupplierRateSchema = new mongoose.Schema(
    {
        supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true },
        packageName: { type: String, required: true, trim: true },
        guests: { type: Number, required: true, min: 1 },
        rooms: { type: Number, min: 0 },
        category: { type: String, required: true, trim: true },
        groupRate: { type: Number, required: true, min: 0 },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

// One rate per (supplier, package, guests, category) — the calculator lookup key
SupplierRateSchema.index({ supplier: 1, packageName: 1, guests: 1, category: 1 }, { unique: true });

export default mongoose.models.SupplierRate || mongoose.model("SupplierRate", SupplierRateSchema);
