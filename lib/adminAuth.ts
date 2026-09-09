import { createHmac, timingSafeEqual } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { ADMIN_COOKIE } from "./hallMenuShared";
import { isSameSiteRequest, jsonNoStore, rateLimit } from "./httpGuard";

const LOGIN_LIMIT = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

function passwordFromLocalFile() {
  const file = path.join(process.cwd(), ".env.local");
  let raw = "";
  try {
    raw = readFileSync(file, "utf8");
  } catch {
    return "";
  }
  if (raw.includes("\u0000")) {
    try {
      raw = readFileSync(file, "utf16le");
    } catch {
      return "";
    }
  }
  const match = raw.replace(/^\uFEFF/, "").match(/^\s*ADMIN_PASSWORD\s*=\s*(.*)$/m);
  if (!match) return "";
  return match[1].trim().replace(/^["']|["']$/g, "");
}

let cachedPassword: string | undefined;

function password() {
  if (cachedPassword !== undefined) return cachedPassword;
  cachedPassword = (process.env.ADMIN_PASSWORD || passwordFromLocalFile()).trim();
  return cachedPassword;
}

function expectedToken() {
  const pass = password();
  if (!pass) return "";
  return createHmac("sha256", pass).update("umi-admin-v1").digest("hex");
}

export function adminConfigured() {
  return Boolean(password());
}

export function loginAllowed(ip: string) {
  return rateLimit(`admin-login:${ip}`, LOGIN_LIMIT, LOGIN_WINDOW_MS);
}

export function checkPassword(input: string) {
  const pass = password();
  if (!pass || !input) return false;
  const left = createHmac("sha256", "umi-pw-cmp").update(input).digest();
  const right = createHmac("sha256", "umi-pw-cmp").update(pass).digest();
  return timingSafeEqual(left, right);
}

function cookieFrom(header: string | null) {
  if (!header) return "";
  for (const part of header.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === ADMIN_COOKIE) return rest.join("=");
  }
  return "";
}

export function isAdminRequest(request: Request) {
  const expected = expectedToken();
  const got = cookieFrom(request.headers.get("cookie"));
  if (!expected || !got) return false;
  const left = Buffer.from(got);
  const right = Buffer.from(expected);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function adminUnauthorized() {
  return jsonNoStore({ ok: false, error: "Нужен вход" }, 401);
}

export function requireAdmin(request: Request, mutate = false) {
  if (mutate && !isSameSiteRequest(request)) {
    return jsonNoStore({ ok: false, error: "Нужен вход" }, 403);
  }
  if (!isAdminRequest(request)) return adminUnauthorized();
  return null;
}

export function sessionCookie(set: boolean) {
  const token = expectedToken();
  const https = (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https:");
  const secure = https ? "; Secure" : "";
  if (!set || !token) {
    return `${ADMIN_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`;
  }
  return `${ADMIN_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800${secure}`;
}
