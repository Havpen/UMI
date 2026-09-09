import { requireAdmin } from "@/lib/adminAuth";
import { jsonNoStore, readJsonBody } from "@/lib/httpGuard";
import { createHallCategory, readHallCategories } from "@/lib/hallMenuStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const deny = requireAdmin(request);
  if (deny) return deny;
  const categories = await readHallCategories();
  return jsonNoStore({ ok: true, categories });
}

export async function POST(request: Request) {
  const deny = requireAdmin(request, true);
  if (deny) return deny;
  const parsed = await readJsonBody<{ title?: string; h1?: string }>(request, 4096);
  if ("error" in parsed) return jsonNoStore({ ok: false, error: "Пустой запрос" }, 400);
  const result = await createHallCategory(String(parsed.data.title ?? ""), parsed.data.h1);
  if ("error" in result) {
    return jsonNoStore({ ok: false, error: result.error }, 400);
  }
  return jsonNoStore({ ok: true, category: result.category });
}
