import { isHoneypot, sanitizePhoneInput, validateCommentField, validateGuestName, validatePhone } from "@/lib/commentModeration";
import { clientIp, isSameSiteRequest, jsonNoStore, rateLimit, readJsonBody } from "@/lib/httpGuard";
import { isClockTime, isVisitDate, parsePartySize } from "@/lib/leadFields";
import { isConsentGiven } from "@/lib/legal";
import { addLead, formatLeadHtml, notifyTelegram } from "@/lib/leads";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type BookingBody = {
  website?: unknown;
  name?: unknown;
  phone?: unknown;
  date?: unknown;
  time?: unknown;
  guests?: unknown;
  comment?: unknown;
  consentPd?: unknown;
  consentTg?: unknown;
};

function hasLeadConsent(body: { consentPd?: unknown; consentTg?: unknown }) {
  return isConsentGiven(body.consentPd) && isConsentGiven(body.consentTg);
}

export async function POST(request: Request) {
  if (!isSameSiteRequest(request)) {
    return jsonNoStore({ ok: false }, 403);
  }
  const ip = clientIp(request);
  if (!rateLimit(`lead:${ip}`, 8, 10 * 60 * 1000) || !rateLimit("lead:global", 40, 10 * 60 * 1000)) {
    return jsonNoStore({ ok: false }, 429);
  }

  const parsed = await readJsonBody<BookingBody>(request);
  if ("error" in parsed) {
    return jsonNoStore({ ok: false }, 400);
  }
  const body = parsed.data;
  if (isHoneypot(body.website)) {
    return jsonNoStore({ ok: true });
  }

  const name = String(body.name ?? "").trim();
  const phone = sanitizePhoneInput(String(body.phone ?? "").trim());
  const date = String(body.date ?? "").trim();
  const time = String(body.time ?? "").trim();
  const comment = String(body.comment ?? "").trim();
  const guests = parsePartySize(String(body.guests ?? ""));
  if (!name || !phone || !date || !time || !guests) {
    return jsonNoStore({ ok: false }, 400);
  }
  if (!isVisitDate(date) || !isClockTime(time)) {
    return jsonNoStore({ ok: false }, 400);
  }

  const nameError = validateGuestName(name);
  if (nameError) {
    return jsonNoStore({ ok: false, error: nameError }, 400);
  }
  const phoneError = validatePhone(phone);
  if (phoneError) {
    return jsonNoStore({ ok: false, error: phoneError }, 400);
  }
  const commentError = validateCommentField(comment);
  if (commentError) {
    return jsonNoStore({ ok: false, error: commentError }, 400);
  }
  if (!hasLeadConsent(body)) {
    return jsonNoStore({ ok: false }, 400);
  }

  const lead = await addLead({
    kind: "booking",
    id: `b-${Date.now()}`,
    at: new Date().toISOString(),
    name,
    phone,
    date,
    time,
    guests,
    comment,
  });

  const telegram = await notifyTelegram(formatLeadHtml(lead));
  if (telegram.reason === "missing-env") {
    console.info(formatLeadHtml(lead));
    return jsonNoStore({ ok: true, queued: "log" });
  }
  if (!telegram.sent) {
    return jsonNoStore({ ok: false }, 502);
  }

  return jsonNoStore({ ok: true });
}
