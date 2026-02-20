import mongoose from "mongoose";

const timeSchema = new mongoose.Schema({
    from: { type: String },
    to: { type: String },
}, { _id: false });

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "LocationImage",
    },
    activities: [
        {
            day: { type: Number, required: true }, // Day 1, Day 2...
            date: { type: Date },
            description: { type: String },
            time: { type: timeSchema, default: () => ({}) },
        }
    ],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.models.Destination || mongoose.model("Destination", destinationSchema);