import mongoose from "mongoose";

const SupplierSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        destination: { type: String, trim: true },
        contactName: { type: String, trim: true },
        phone: { type: String, trim: true },
        email: { type: String, trim: true },
        currency: { type: String, default: "INR", trim: true },
        notes: { type: String },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Supplier || mongoose.model("Supplier", SupplierSchema);
