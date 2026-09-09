import {
  adminConfigured,
  checkPassword,
  loginAllowed,
  sessionCookie,
} from "@/lib/adminAuth";
import { clientIp, isSameSiteRequest, jsonNoStore, readJsonBody } from "@/lib/httpGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameSiteRequest(request)) {
    return jsonNoStore({ ok: false, error: "Нужен вход" }, 403);
  }
  if (!adminConfigured()) {
    return jsonNoStore({ ok: false, error: "Задайте ADMIN_PASSWORD в .env.local" }, 503);
  }
  const ip = clientIp(request);
  if (!loginAllowed(ip)) {
    return jsonNoStore({ ok: false, error: "Слишком много попыток" }, 429);
  }
  const parsed = await readJsonBody<{ password?: string }>(request, 2048);
  if ("error" in parsed) {
    return jsonNoStore({ ok: false, error: "Неверный пароль" }, 400);
  }
  const ok = checkPassword(String(parsed.data.password ?? ""));
  if (!ok) {
    return jsonNoStore({ ok: false, error: "Неверный пароль" }, 401);
  }
  const response = jsonNoStore({ ok: true });
  response.headers.set("Set-Cookie", sessionCookie(true));
  return response;
}
