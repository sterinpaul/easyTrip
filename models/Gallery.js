import mongoose from "mongoose";

const GallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    location: { type: String },
    image: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Gallery || mongoose.model("Gallery", GallerySchema);
