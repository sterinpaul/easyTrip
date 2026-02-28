import mongoose from "mongoose";

const ItinerarySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    packageId: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    guestCount: { type: Number, required: true },
    departureFrom: { type: String, required: true },
    arrivalAt: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    duration: {
      days: { type: Number, required: true },
      nights: { type: Number, required: true },
    },
    category: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    totalCost: { type: Number },
    rewardPoints: { type: Number },
    notes: { type: String },
    transportationModes: { type: [String], required: true },
    heroImage: { type: mongoose.Schema.Types.ObjectId, ref: "Image" },
    highlightImages: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Image" }] },
    includes: { type: [String], required: true },
    excludes: { type: [String], required: true },
    offer: { type: mongoose.Schema.Types.ObjectId, ref: "Offer" },
    destinations: { type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Destination" }], required: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The creator
  },
  { timestamps: true }
);


export default mongoose.models.Itinerary || mongoose.model("Itinerary", ItinerarySchema);
