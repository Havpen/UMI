import { adminConfigured, isAdminRequest } from "@/lib/adminAuth";
import { jsonNoStore } from "@/lib/httpGuard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return jsonNoStore({
    ok: isAdminRequest(request),
    configured: adminConfigured(),
  });
}
