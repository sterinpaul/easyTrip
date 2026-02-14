import mongoose from "mongoose";

const ItinerarySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ["upcoming", "past", "draft"], 
      default: "draft" 
    },
    destinations: [{ type: String }],
    activities: [
      {
        day: { type: Number, required: true }, // Day 1, Day 2...
        date: { type: Date },
        title: { type: String },
        description: { type: String },
        time: { type: String },
        location: { type: String },
        image: { type: String }, // Cloudinary URL
      }
    ],
    totalCost: { type: Number },
    notes: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The creator
  },
  { timestamps: true }
);

// Virtual property to check if past or upcoming based on date
ItinerarySchema.pre('save', function(next) {
    const today = new Date();
    if (this.endDate < today) {
        this.status = 'past';
    } else if (this.startDate > today) {
        this.status = 'upcoming';
    }
    next();
});

export default mongoose.models.Itinerary || mongoose.model("Itinerary", ItinerarySchema);
