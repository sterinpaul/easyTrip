import mongoose from "mongoose";

const ClientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    phone: { type: String },
    address: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // The creator
  },
  { timestamps: true }
);

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);
