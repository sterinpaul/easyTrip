import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
    },
    image: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Image",
      set: (v) => v === "" ? null : v,
    },
    role: {
      type: String,
      default: "user"
    },
    isActive: { type: Boolean, default: true },
    provider: {
      type: String,
      default: "email",
    },
    otp: {
      type: String,
    },
    otpExpiry: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
