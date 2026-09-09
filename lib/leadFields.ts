import { minskNow } from "./content";

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function isClockTime(value: string) {
  return TIME_RE.test(value);
}

export function isVisitDate(value: string) {
  if (!DATE_RE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) {
    return false;
  }
  const now = minskNow();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const picked = Date.UTC(year, month - 1, day);
  const dayMs = 86_400_000;
  return picked >= today - dayMs && picked <= today + 90 * dayMs;
}

export function parsePartySize(raw: string, max = 20) {
  const n = Number.parseInt(String(raw).trim(), 10);
  if (!Number.isInteger(n) || n < 1 || n > max) return "";
  return String(n);
}
