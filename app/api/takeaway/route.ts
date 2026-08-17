import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const lines = Array.isArray(body.items)
    ? body.items.map((item: { name?: string; qty?: number; price?: string }) => {
        return `• ${item.name ?? ""} × ${item.qty ?? 1} — ${item.price ?? ""}`;
      })
    : [];

  const text = ["ВЫНОС", ...lines, `Сумма: ${body.sum ?? ""} Br`, `Телефон: ${body.phone ?? ""}`, `Время: ${body.time ?? ""}`, `Персон: ${body.persons ?? ""}`, `Комментарий: ${body.comment ?? ""}`].join(
    "\n",
  );

  if (!token || !chatId) {
    console.info(text);
    return NextResponse.json({ ok: true, queued: "log" });
  }

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
