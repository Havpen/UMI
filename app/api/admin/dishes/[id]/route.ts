import { requireAdmin } from "@/lib/adminAuth";
import { jsonNoStore, readJsonBody } from "@/lib/httpGuard";
import { deleteHallDish, updateHallDish } from "@/lib/hallMenuStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  const deny = requireAdmin(request, true);
  if (deny) return deny;
  const { id } = await ctx.params;
  const parsed = await readJsonBody<Record<string, string>>(request, 16 * 1024);
  if ("error" in parsed) return jsonNoStore({ ok: false, error: "Пустой запрос" }, 400);
  const body = parsed.data;
  const result = await updateHallDish(id, {
    name: body.name,
    price: body.price,
    weight: body.weight,
    description: body.description,
    category: body.category,
    move: body.move === "up" || body.move === "down" ? body.move : undefined,
  });
  if ("error" in result) {
    return jsonNoStore({ ok: false, error: result.error }, 400);
  }
  return jsonNoStore({ ok: true, dish: result.dish });
}

export async function DELETE(request: Request, ctx: Ctx) {
  const deny = requireAdmin(request, true);
  if (deny) return deny;
  const { id } = await ctx.params;
  const result = await deleteHallDish(id);
  if ("error" in result) {
    return jsonNoStore({ ok: false, error: result.error }, 400);
  }
  return jsonNoStore({ ok: true });
}
