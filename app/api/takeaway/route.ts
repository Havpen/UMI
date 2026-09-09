import { isHoneypot, sanitizePhoneInput, validateCommentField, validatePhone, validateTakeawayName } from "@/lib/commentModeration";
import { clientIp, isSameSiteRequest, jsonNoStore, rateLimit, readJsonBody } from "@/lib/httpGuard";
import { isClockTime, parsePartySize } from "@/lib/leadFields";
import { isConsentGiven } from "@/lib/legal";
import { addLead, formatLeadHtml, notifyTelegram, type LeadItem } from "@/lib/leads";
import { isSafeDishId } from "@/lib/hallMenuShared";
import { readHallMenu } from "@/lib/hallMenuStore";
import { formatSum, parsePrice } from "@/lib/money";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_LINES = 30;
const MAX_QTY = 20;

type TakeawayBody = {
  website?: unknown;
  name?: unknown;
  phone?: unknown;
  time?: unknown;
  persons?: unknown;
  comment?: unknown;
  items?: unknown;
  consentPd?: unknown;
  consentTg?: unknown;
};

export async function POST(request: Request) {
  if (!isSameSiteRequest(request)) {
    return jsonNoStore({ ok: false }, 403);
  }
  const ip = clientIp(request);
  if (!rateLimit(`lead:${ip}`, 8, 10 * 60 * 1000) || !rateLimit("lead:global", 40, 10 * 60 * 1000)) {
    return jsonNoStore({ ok: false }, 429);
  }

  const parsed = await readJsonBody<TakeawayBody>(request);
  if ("error" in parsed) {
    return jsonNoStore({ ok: false }, 400);
  }
  const body = parsed.data;
  if (isHoneypot(body.website)) {
    return jsonNoStore({ ok: true });
  }

  const menu = await readHallMenu();
  const byId = new Map(menu.map((dish) => [dish.id, dish]));
  const rawItems = Array.isArray(body.items) ? body.items.slice(0, MAX_LINES) : [];
  const items: LeadItem[] = [];
  for (const row of rawItems) {
    if (!row || typeof row !== "object") continue;
    const id = String((row as { id?: unknown }).id ?? "");
    if (!isSafeDishId(id)) continue;
    const dish = byId.get(id);
    if (!dish) continue;
    const qty = Number((row as { qty?: unknown }).qty);
    const safeQty = Number.isInteger(qty) && qty > 0 ? Math.min(qty, MAX_QTY) : 1;
    items.push({ name: dish.name, qty: safeQty, price: dish.price });
  }

  const name = String(body.name ?? "").trim();
  const phone = sanitizePhoneInput(String(body.phone ?? "").trim());
  const time = String(body.time ?? "").trim();
  const comment = String(body.comment ?? "").trim();
  const persons = parsePartySize(String(body.persons ?? ""));
  if (!name || !phone || !time || !persons || items.length === 0) {
    return jsonNoStore({ ok: false }, 400);
  }
  if (!isClockTime(time)) {
    return jsonNoStore({ ok: false }, 400);
  }

  const nameError = validateTakeawayName(name);
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
  if (!isConsentGiven(body.consentPd) || !isConsentGiven(body.consentTg)) {
    return jsonNoStore({ ok: false }, 400);
  }

  const sum = formatSum(
    items.reduce((total, item) => total + parsePrice(item.price) * item.qty, 0),
  );

  const lead = await addLead({
    kind: "takeaway",
    id: `t-${Date.now()}`,
    at: new Date().toISOString(),
    name,
    phone,
    time,
    persons,
    comment,
    sum,
    items,
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
