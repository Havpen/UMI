import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

export type LeadItem = { name: string; qty: number; price: string };

export type BookingLead = {
  kind: "booking";
  id: string;
  at: string;
  name: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  comment: string;
};

export type TakeawayLead = {
  kind: "takeaway";
  id: string;
  at: string;
  name: string;
  phone: string;
  time: string;
  persons: string;
  comment: string;
  sum: string;
  items: LeadItem[];
};

export type Lead = BookingLead | TakeawayLead;

type Store = { leads: Lead[] };

const storeFile = () => path.join(process.cwd(), "data", "leads.json");

function esc(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function minskDay(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Minsk",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function minskStamp(iso: string) {
  return new Intl.DateTimeFormat("ru-BY", {
    timeZone: "Europe/Minsk",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

async function load(): Promise<Store> {
  try {
    const raw = await readFile(storeFile(), "utf8");
    const parsed = JSON.parse(raw) as Store;
    return { leads: Array.isArray(parsed.leads) ? parsed.leads : [] };
  } catch {
    return { leads: [] };
  }
}

async function save(store: Store) {
  await mkdir(path.dirname(storeFile()), { recursive: true });
  await writeFile(storeFile(), `${JSON.stringify(store, null, 2)}\n`, "utf8");
}

export async function addLead(lead: Lead) {
  const store = await load();
  store.leads.push(lead);
  await save(store);
  return lead;
}

export async function listLeads() {
  return (await load()).leads;
}

export function formatLeadHtml(lead: Lead) {
  if (lead.kind === "booking") {
    return [
      "<b>Заявка на бронь</b>",
      `Когда пришла: ${esc(minskStamp(lead.at))}`,
      `Имя: ${esc(lead.name)}`,
      `Телефон: ${esc(lead.phone)}`,
      `Дата: ${esc(lead.date)}`,
      `Время: ${esc(lead.time)}`,
      `Гостей: ${esc(lead.guests)}`,
      `Комментарий: ${esc(lead.comment || "—")}`,
      "",
      "<i>Это заявка, не бронь. Подтвердите звонком.</i>",
    ].join("\n");
  }

  const dishes = lead.items.length
    ? lead.items.map((item) => `• ${esc(item.name)} × ${item.qty} — ${esc(item.price)}`).join("\n")
    : "• —";

  return [
    "<b>Заявка на вынос</b>",
    `Когда пришла: ${esc(minskStamp(lead.at))}`,
    dishes,
    `Сумма: ${esc(lead.sum)} Br`,
    `Имя: ${esc(lead.name)}`,
    `Телефон: ${esc(lead.phone)}`,
    `Время получения: ${esc(lead.time)}`,
    `Персон: ${esc(lead.persons)}`,
    `Комментарий: ${esc(lead.comment || "—")}`,
    "",
    "<i>Это заявка, не заказ. Подтвердите звонком.</i>",
  ].join("\n");
}

export function formatStats(leads: Lead[]) {
  const now = Date.now();
  const today = minskDay(new Date().toISOString());
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const monthAgo = now - 30 * 24 * 60 * 60 * 1000;

  function count(kind: Lead["kind"], from?: number, day?: string) {
    return leads.filter((lead) => {
      if (lead.kind !== kind) return false;
      if (day) return minskDay(lead.at) === day;
      if (from) return new Date(lead.at).getTime() >= from;
      return true;
    }).length;
  }

  return [
    "<b>Заявки через сайт UMI</b>",
    "",
    "<b>Сегодня</b>",
    `Бронь: ${count("booking", undefined, today)}`,
    `Вынос: ${count("takeaway", undefined, today)}`,
    "",
    "<b>7 дней</b>",
    `Бронь: ${count("booking", weekAgo)}`,
    `Вынос: ${count("takeaway", weekAgo)}`,
    "",
    "<b>30 дней</b>",
    `Бронь: ${count("booking", monthAgo)}`,
    `Вынос: ${count("takeaway", monthAgo)}`,
    "",
    `Всего: бронь ${count("booking")}, вынос ${count("takeaway")}`,
    "",
    "<i>Считаются заявки с сайта, не подтверждённые столы и не касса.</i>",
  ].join("\n");
}

export function formatToday(leads: Lead[]) {
  const today = minskDay(new Date().toISOString());
  const rows = leads.filter((lead) => minskDay(lead.at) === today);
  if (!rows.length) return "Сегодня заявок с сайта ещё не было.";

  const lines = rows.slice(-20).map((lead) => {
    if (lead.kind === "booking") {
      return `• Бронь ${minskStamp(lead.at)} — ${lead.name}, ${lead.phone}, ${lead.date} ${lead.time}, ${lead.guests} гост.`;
    }
    return `• Вынос ${minskStamp(lead.at)} — ${lead.name ? `${lead.name}, ` : ""}${lead.phone}, к ${lead.time}, ${lead.persons || "?"} персон, ${lead.sum} Br`;
  });

  return ["<b>Сегодня с сайта</b>", ...lines].join("\n");
}

export async function notifyTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { sent: false, reason: "missing-env" as const };

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    console.error("Telegram sendMessage failed", response.status, details);
    return { sent: false, reason: "telegram" as const };
  }

  return { sent: true as const };
}
