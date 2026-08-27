import { NextRequest, NextResponse } from "next/server";
import { ContactFormSchema } from "@/lib/validation/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const parseResult = ContactFormSchema.safeParse(body);
    if (!parseResult.success) {
      const errorMsg = parseResult.error.errors[0]?.message || "Invalid input data.";
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { name, email, subject, message, honeypot } = parseResult.data;

    // Bot trap detection
    if (honeypot) {
      return NextResponse.json({ success: true, message: "Message received." });
    }

    // In production, integrate email provider (Resend, SendGrid, Postmark)
    console.log(`📨 New contact form message received from ${name} (${email}): [${subject}] ${message}`);

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. Thank you!",
    });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
