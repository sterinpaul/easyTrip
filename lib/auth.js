import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { authConfig } from "@/auth.config";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        await dbConnect();
        const { email, otp } = credentials;

        const user = await User.findOne({ email });

        if (!user) {
          throw new Error("User not found.");
        }

        if (user.otp !== otp) {
          throw new Error("Invalid OTP.");
        }

        if (new Date() > user.otpExpiry) {
          throw new Error("OTP Expired.");
        }

        // Clear OTP after successful login
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        return user;
      },
    }),
  ],
});
