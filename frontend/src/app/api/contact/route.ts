import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 }
      );
    }

    if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("placeholder")) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || "support@cartnova.com",
        to: process.env.ADMIN_EMAIL || "support@cartnova.com",
        subject: `[Contact Form] ${subject || "Inquiry from " + name}`,
        text: `From: ${name} (${email})\n\nMessage:\n${message}`,
      });
    } else {
      console.log(`[Contact Form Received] From: ${name} <${email}>, Subject: ${subject}\nMessage: ${message}`);
    }

    return NextResponse.json(
      { success: true, message: "Thank you for reaching out! Our team will respond within 24 hours." },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit contact request" },
      { status: 500 }
    );
  }
}
