import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { sendContactNotificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Name, email, subject, and message are required" },
        { status: 400 },
      );
    }

    const client = await clientPromise;
    const db = client.db("printwibe");

    // Save contact message to database
    const contactMessage = {
      name,
      email,
      phone: phone || null,
      subject,
      message,
      status: "new", // new, read, replied
      createdAt: new Date(),
    };

    const result = await db.collection("contacts").insertOne(contactMessage);

    // Send email notification to admin
    await sendContactNotificationEmail({
      name,
      email,
      phone,
      subject,
      message,
    });

    return NextResponse.json(
      {
        message: "Contact form submitted successfully",
        contactId: result.insertedId,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Failed to submit contact form" },
      { status: 500 },
    );
  }
}
