import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.info("БРОНЬ", body);
    return NextResponse.json({ ok: true, queued: "log" });
  }

  const text = [
    "БРОНЬ",
    `Имя: ${body.name ?? ""}`,
    `Телефон: ${body.phone ?? ""}`,
    `Дата: ${body.date ?? ""}`,
    `Время: ${body.time ?? ""}`,
    `Гостей: ${body.guests ?? ""}`,
    `Комментарий: ${body.comment ?? ""}`,
  ].join("\n");

  const telegram = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });

  if (!telegram.ok) {
    return NextResponse.json({ ok: false }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
