import mongoose from "mongoose";

const TransportationSchema = new mongoose.Schema(
    {
        mode: { type: String, enum: ["FLIGHT", "BUS", "TRAIN", "CRUISE", "CAR"] },
        from: { type: String, required: true },
        to: { type: String, required: true },
        departureTime: { type: Date },
        arrivalTime: { type: Date },
        vehicleDetails: { type: String },
        notes: { type: String },
        isActive: { type: Boolean, default: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The creator
    },
    { timestamps: true }
);

export default mongoose.models.Transportation || mongoose.model("Transportation", TransportationSchema);