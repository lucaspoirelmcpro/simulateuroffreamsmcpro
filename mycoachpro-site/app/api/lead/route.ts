import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Honeypot check
    if (body.website) {
      return NextResponse.json({ ok: true });
    }

    // Log lead (in production, send to CRM / email / Airtable)
    console.log("[MyCoach Pro] New lead:", {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      org: body.org,
      role: body.role,
      timestamp: new Date().toISOString(),
    });

    // TODO: integrate with CRM, Airtable, SendGrid, etc.
    // Example: await sendToAirtable(body);
    // Example: await sendNotificationEmail(body);

    return NextResponse.json({ ok: true, message: "Lead received" });
  } catch (error) {
    console.error("[MyCoach Pro] Lead submission error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
