import { requireAdmin } from "@/lib/adminAuth";
import { jsonNoStore, uploadTooLarge, UPLOAD_LIMIT_BYTES } from "@/lib/httpGuard";
import { attachHallDishImage } from "@/lib/hallMenuStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  const deny = requireAdmin(request, true);
  if (deny) return deny;
  if (uploadTooLarge(request)) {
    return jsonNoStore({ ok: false, error: "Файл больше 12 МБ" }, 413);
  }
  const { id } = await ctx.params;
  const form = await request.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File) || file.size < 20) {
    return jsonNoStore({ ok: false, error: "Приложите картинку" }, 400);
  }
  if (file.size > UPLOAD_LIMIT_BYTES) {
    return jsonNoStore({ ok: false, error: "Файл больше 12 МБ" }, 413);
  }
  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const result = await attachHallDishImage(id, buffer);
    if ("error" in result) {
      return jsonNoStore({ ok: false, error: result.error }, 400);
    }
    return jsonNoStore({ ok: true, dish: result.dish });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Не удалось сжать фото";
    return jsonNoStore({ ok: false, error: message }, 400);
  }
}
