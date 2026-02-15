import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { login } from "@/lib/auth";

export async function POST(req) {
    try {
        const { email, otp } = await req.json();

        await dbConnect();

        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json({ error: "User not found." }, { status: 404 });
        }

        if (user.otp !== otp) {
            return NextResponse.json({ error: "Invalid OTP." }, { status: 401 });
        }

        if (new Date() > user.otpExpiry) {
            return NextResponse.json({ error: "OTP Expired." }, { status: 401 });
        }

        // Clear OTP after successful login
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();

        // Create session
        await login({
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image
        });

        return NextResponse.json({ success: true, user });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
