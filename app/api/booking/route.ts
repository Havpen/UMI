import { NextResponse } from "next/server";
import { isHoneypot, sanitizePhoneInput, validateCommentField, validateGuestName, validatePhone } from "@/lib/commentModeration";
import { addLead, formatLeadHtml, notifyTelegram } from "@/lib/leads";

export async function POST(request: Request) {
  const body = await request.json();
  if (isHoneypot(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const phone = sanitizePhoneInput(String(body.phone ?? "").trim());
  const date = String(body.date ?? "").trim();
  const time = String(body.time ?? "").trim();
  const comment = String(body.comment ?? "").trim();
  if (!name || !phone || !date || !time) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const nameError = validateGuestName(name);
  if (nameError) {
    return NextResponse.json({ ok: false, error: nameError }, { status: 400 });
  }
  const phoneError = validatePhone(phone);
  if (phoneError) {
    return NextResponse.json({ ok: false, error: phoneError }, { status: 400 });
  }
  const commentError = validateCommentField(comment);
  if (commentError) {
    return NextResponse.json({ ok: false, error: commentError }, { status: 400 });
  }

  const lead = await addLead({
    kind: "booking",
    id: `b-${Date.now()}`,
    at: new Date().toISOString(),
    name,
    phone,
    date,
    time,
    guests: String(body.guests ?? "").trim(),
    comment,
  });

  const telegram = await notifyTelegram(formatLeadHtml(lead));
  if (telegram.reason === "missing-env") {
    console.info(formatLeadHtml(lead));
    return NextResponse.json({ ok: true, queued: "log" });
  }
  if (!telegram.sent) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
