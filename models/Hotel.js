import mongoose from "mongoose";

const HotelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        address: { type: String },
        city: { type: String },
        phone: { type: String },
        email: { type: String },
        website: { type: String },
        starRating: { type: Number, min: 1, max: 5 },
        image: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Hotel || mongoose.model("Hotel", HotelSchema);