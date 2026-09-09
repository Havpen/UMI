import { sessionCookie } from "@/lib/adminAuth";
import { isSameSiteRequest, jsonNoStore } from "@/lib/httpGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!isSameSiteRequest(request)) {
    return jsonNoStore({ ok: false }, 403);
  }
  const response = jsonNoStore({ ok: true });
  response.headers.set("Set-Cookie", sessionCookie(false));
  return response;
}
