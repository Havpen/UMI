import { requireAdmin } from "@/lib/adminAuth";
import { jsonNoStore, readJsonBody } from "@/lib/httpGuard";
import { createHallDish, readHallCategories, readHallMenu } from "@/lib/hallMenuStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const deny = requireAdmin(request);
  if (deny) return deny;
  const dishes = await readHallMenu();
  const categories = await readHallCategories();
  return jsonNoStore({ ok: true, dishes, categories });
}

export async function POST(request: Request) {
  const deny = requireAdmin(request, true);
  if (deny) return deny;
  const parsed = await readJsonBody<Record<string, string>>(request, 16 * 1024);
  if ("error" in parsed) return jsonNoStore({ ok: false, error: "Пустой запрос" }, 400);
  const body = parsed.data;
  const result = await createHallDish({
    name: body.name ?? "",
    price: body.price ?? "",
    weight: body.weight ?? "",
    description: body.description ?? "",
    category: body.category ?? "",
  });
  if ("error" in result) {
    return jsonNoStore({ ok: false, error: result.error }, 400);
  }
  return jsonNoStore({ ok: true, dish: result.dish });
}
