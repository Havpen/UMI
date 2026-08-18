import { NextResponse } from "next/server";
import { isHoneypot, sanitizePhoneInput, validateCommentField, validatePhone, validateTakeawayName } from "@/lib/commentModeration";
import { addLead, formatLeadHtml, notifyTelegram, type LeadItem } from "@/lib/leads";

export async function POST(request: Request) {
  const body = await request.json();
  if (isHoneypot(body.website)) {
    return NextResponse.json({ ok: true });
  }

  const items: LeadItem[] = Array.isArray(body.items)
    ? body.items.map((item: { name?: string; qty?: number; price?: string }) => ({
        name: String(item.name ?? "").trim(),
        qty: Number(item.qty) > 0 ? Number(item.qty) : 1,
        price: String(item.price ?? "").trim(),
      }))
    : [];

  const name = String(body.name ?? "").trim();
  const phone = sanitizePhoneInput(String(body.phone ?? "").trim());
  const time = String(body.time ?? "").trim();
  const comment = String(body.comment ?? "").trim();
  if (!name || !phone || !time || items.length === 0) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const nameError = validateTakeawayName(name);
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
    kind: "takeaway",
    id: `t-${Date.now()}`,
    at: new Date().toISOString(),
    name,
    phone,
    time,
    persons: String(body.persons ?? "").trim(),
    comment,
    sum: String(body.sum ?? "").trim(),
    items,
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
