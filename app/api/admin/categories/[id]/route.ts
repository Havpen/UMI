import { requireAdmin } from "@/lib/adminAuth";
import { jsonNoStore } from "@/lib/httpGuard";
import { deleteHallCategory } from "@/lib/hallMenuStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, ctx: Ctx) {
  const deny = requireAdmin(request, true);
  if (deny) return deny;
  const { id } = await ctx.params;
  const result = await deleteHallCategory(id);
  if ("error" in result) {
    return jsonNoStore({ ok: false, error: result.error }, 400);
  }
  return jsonNoStore({ ok: true });
}
