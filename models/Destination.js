import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    transportation: {
        outbound: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transportation"
        },
        inbound: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Transportation"
        }
    },
    hotelDetails: [
        {
            type: { type: String, enum: ["ECONOMY", "STANDARD", "PREMIUM", "DELUXE"], default: "STANDARD", required: true },
            isSelected: { type: Boolean, default: false },
            hotels: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }], required: true }
        }
    ],
    itinerary: [
        {
            day: { type: Number, required: true }, // Day 1, Day 2...
            title: { type: String, required: false },
            activities: [
                {
                    activity: { type: String, required: true },
                    subActivities: { type: [String], required: false }
                }
            ],
        }
    ],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.models.Destination || mongoose.model("Destination", destinationSchema);