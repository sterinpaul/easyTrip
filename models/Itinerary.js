import mongoose from "mongoose";

const ItinerarySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    travelFrom: { type: String, required: true },
    travelTo: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    description: { type: String },
    totalCost: { type: Number },
    notes: { type: String },
    destinations: {
      type: Array,
      items: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Destination",
        required: true,
      }
    },
    transportation: {
      inbound: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transportation"
      },
      outbound: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transportation"
      }
    },
    status: {
      type: String,
      enum: ["saved", "draft"],
      default: "draft"
    },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The creator
  },
  { timestamps: true }
);


export default mongoose.models.Itinerary || mongoose.model("Itinerary", ItinerarySchema);
