import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
process.chdir(root);

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    const full = path.join(root, file);
    if (!existsSync(full)) continue;
    for (const line of readFileSync(full, "utf8").split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq < 1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value;
    }
  }
}

loadEnv();

const token = process.env.TELEGRAM_BOT_TOKEN;
const adminChat = process.env.TELEGRAM_CHAT_ID;

function storePath() {
  return path.join(root, "data", "leads.json");
}

function loadLeads() {
  try {
    const parsed = JSON.parse(readFileSync(storePath(), "utf8"));
    return Array.isArray(parsed.leads) ? parsed.leads : [];
  } catch {
    return [];
  }
}

function minskDay(iso) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Minsk",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function minskStamp(iso) {
  return new Intl.DateTimeFormat("ru-BY", {
    timeZone: "Europe/Minsk",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function count(leads, kind, from, day) {
  return leads.filter((lead) => {
    if (lead.kind !== kind) return false;
    if (day) return minskDay(lead.at) === day;
    if (from) return new Date(lead.at).getTime() >= from;
    return true;
  }).length;
}

function statsText(leads) {
  const now = Date.now();
  const today = minskDay(new Date().toISOString());
  return [
    "<b>Заявки через сайт UMI</b>",
    "",
    "<b>Сегодня</b>",
    `Бронь: ${count(leads, "booking", undefined, today)}`,
    `Вынос: ${count(leads, "takeaway", undefined, today)}`,
    "",
    "<b>7 дней</b>",
    `Бронь: ${count(leads, "booking", now - 7 * 864e5)}`,
    `Вынос: ${count(leads, "takeaway", now - 7 * 864e5)}`,
    "",
    "<b>30 дней</b>",
    `Бронь: ${count(leads, "booking", now - 30 * 864e5)}`,
    `Вынос: ${count(leads, "takeaway", now - 30 * 864e5)}`,
    "",
    `Всего: бронь ${count(leads, "booking")}, вынос ${count(leads, "takeaway")}`,
    "",
    "<i>Считаются заявки с сайта, не подтверждённые столы и не касса.</i>",
  ].join("\n");
}

function todayText(leads) {
  const today = minskDay(new Date().toISOString());
  const rows = leads.filter((lead) => minskDay(lead.at) === today);
  if (!rows.length) return "Сегодня заявок с сайта ещё не было.";
  const lines = rows.slice(-20).map((lead) => {
    if (lead.kind === "booking") {
      return `• Бронь ${minskStamp(lead.at)} — ${lead.name}, ${lead.phone}, ${lead.date} ${lead.time}, ${lead.guests} гост.`;
    }
    return `• Вынос ${minskStamp(lead.at)} — ${lead.phone}, к ${lead.time}, ${lead.persons || "?"} персон, ${lead.sum} Br`;
  });
  return ["<b>Сегодня с сайта</b>", ...lines].join("\n");
}

const help = [
  "<b>UMI — заявки с сайта</b>",
  "",
  "Новые бронь и вынос приходят сюда сами, когда гость отправил форму.",
  "",
  "/stats — сколько заявок сегодня, за 7 и 30 дней",
  "/today — список заявок за сегодня",
].join("\n");

async function api(method, body) {
  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await response.json();
  if (!json.ok) throw new Error(`${method}: ${JSON.stringify(json)}`);
  return json.result;
}

function isAdmin(chatId) {
  if (!adminChat) return false;
  return String(chatId) === String(adminChat);
}

async function handle(message) {
  const text = (message.text || "").trim();
  const chatId = message.chat?.id;
  if (!chatId || !text.startsWith("/")) return;

  if (!adminChat) {
    await api("sendMessage", {
      chat_id: chatId,
      text: `Чтобы привязать чат, добавьте в .env.local:\nTELEGRAM_CHAT_ID=${chatId}`,
    });
    console.log("TELEGRAM_CHAT_ID=", chatId);
    return;
  }

  if (!isAdmin(chatId)) {
    await api("sendMessage", { chat_id: chatId, text: "Нет доступа." });
    return;
  }

  const cmd = text.split(/\s+/)[0].split("@")[0].toLowerCase();
  const leads = loadLeads();
  let reply = help;
  if (cmd === "/stats") reply = statsText(leads);
  if (cmd === "/today") reply = todayText(leads);

  await api("sendMessage", {
    chat_id: chatId,
    text: reply,
    parse_mode: "HTML",
  });
}

async function main() {
  if (!token) {
    console.error("Нет TELEGRAM_BOT_TOKEN. Заполните .env.local (см. .env.example) и запустите снова.");
    process.exit(1);
  }

  await api("setMyCommands", {
    commands: [
      { command: "stats", description: "Статистика заявок с сайта" },
      { command: "today", description: "Заявки за сегодня" },
      { command: "start", description: "Справка" },
    ],
  });

  console.log("Бот UMI слушает Telegram. Сайт: localhost:3000. Команды: /stats /today");
  if (!adminChat) console.log("TELEGRAM_CHAT_ID пуст — напишите боту любое сообщение, в ответ придёт id чата.");

  let offset = 0;
  while (true) {
    const updates = await api("getUpdates", {
      timeout: 30,
      offset,
      allowed_updates: ["message"],
    });
    for (const update of updates) {
      offset = update.update_id + 1;
      if (update.message) {
        try {
          await handle(update.message);
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
