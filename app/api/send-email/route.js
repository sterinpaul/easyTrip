import { auth } from "@/lib/auth";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { to, subject, message, attachmentUrl } = await req.json();

    if (!to || !subject || !message) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.NODEMAILER_EMAIL,
      to,
      subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="color: #6d28d9;">Here is your Itinerary!</h2>
        <p>${message.replace(/\n/g, "<br>")}</p>
        <p>You can also download it directly from the link below:</p>
        <a href="${attachmentUrl}" style="background-color: #6d28d9; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download PDF</a>
        <br><br>
        <p>Safe travels,<br>EasyTrip Team</p>
      </div>`,
      attachments: attachmentUrl ? [
        {
          filename: 'Itinerary.pdf',
          path: attachmentUrl // Nodemailer can fetch from URL
        }
      ] : []
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
