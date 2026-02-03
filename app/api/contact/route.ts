import { NextResponse } from "next/server";

type ContactBody = {
  name?: unknown;
  email?: unknown;
  message?: unknown;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ContactBody;
    const name = typeof body.name === "string" ? body.name : "";
    const email = typeof body.email === "string" ? body.email : "";
    const message = typeof body.message === "string" ? body.message : "";

    if (!name.trim() || !email.trim() || !message.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required" },
        { status: 400 },
      );
    }

    // TODO: Send email (e.g. Resend, SendGrid, Nodemailer) or save to DB
    // For now we just validate and return success
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 },
    );
  }
}
