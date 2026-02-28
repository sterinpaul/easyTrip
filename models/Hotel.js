import mongoose from "mongoose";

const HotelSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        address: { type: String },
        phone: { type: String },
        email: { type: String },
        image: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
);

export default mongoose.models.Hotel || mongoose.model("Hotel", HotelSchema);