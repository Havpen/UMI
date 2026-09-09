import { NextResponse } from "next/server";

const buckets = new Map<string, { count: number; resetAt: number }>();

export const JSON_LIMIT_BYTES = 24 * 1024;
export const UPLOAD_LIMIT_BYTES = 12 * 1024 * 1024;

function pruneBuckets(now: number) {
  if (buckets.size < 800) return;
  for (const [key, row] of buckets) {
    if (row.resetAt < now) buckets.delete(key);
  }
  if (buckets.size > 4000) buckets.clear();
}

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  pruneBuckets(now);
  const row = buckets.get(key);
  if (!row || row.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (row.count >= limit) return false;
  row.count += 1;
  return true;
}

export function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  if (forwarded && forwarded.length < 80) return forwarded;
  const real = request.headers.get("x-real-ip")?.trim() ?? "";
  if (real && real.length < 80) return real;
  return "local";
}

export function isSameSiteRequest(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") return false;
  if (fetchSite === "same-origin" || fetchSite === "same-site") return true;
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const allowed = new Set<string>();
  try {
    allowed.add(new URL(request.url).origin);
  } catch {
    /* ignore */
  }
  const publicUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (publicUrl) {
    try {
      allowed.add(new URL(publicUrl).origin);
    } catch {
      /* ignore */
    }
  }
  try {
    return allowed.has(new URL(origin).origin);
  } catch {
    return false;
  }
}

export async function readJsonBody<T>(
  request: Request,
  maxBytes = JSON_LIMIT_BYTES,
): Promise<{ data: T } | { error: "too-large" | "bad-type" | "bad-json" }> {
  const length = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(length) && length > maxBytes) return { error: "too-large" };
  const type = request.headers.get("content-type") ?? "";
  if (!type.toLowerCase().includes("application/json")) return { error: "bad-type" };
  const text = await request.text();
  if (text.length > maxBytes) return { error: "too-large" };
  try {
    return { data: JSON.parse(text) as T };
  } catch {
    return { error: "bad-json" };
  }
}

export function jsonNoStore(data: unknown, status = 200) {
  const response = NextResponse.json(data, { status });
  response.headers.set("Cache-Control", "no-store");
  return response;
}

export function uploadTooLarge(request: Request, maxBytes = UPLOAD_LIMIT_BYTES) {
  const length = Number(request.headers.get("content-length") || "0");
  return Number.isFinite(length) && length > maxBytes + 1024 * 1024;
}
