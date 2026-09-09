export type MenuCategoryId = string;

export type HallCategory = {
  id: MenuCategoryId;
  title: string;
  h1: string;
  titleEn?: string;
  h1En?: string;
};

export type HallDish = {
  id: string;
  name: string;
  price: string;
  category: MenuCategoryId;
  image?: string;
  description?: string;
  weight?: string;
  nameEn?: string;
  descriptionEn?: string;
};

export const ADMIN_COOKIE = "umi_admin";

export const RESERVED_CATEGORY_IDS = new Set([
  "hits",
  "lunch",
  "brunch",
  "menu",
  "admin",
  "api",
  "booking",
  "contacts",
  "delivery",
]);

const CYR_TO_LAT: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "e",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "sch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

export function slugifyName(name: string) {
  const translit = name
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .split("")
    .map((char) => CYR_TO_LAT[char] ?? char)
    .join("");
  const slug = translit
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
  return slug || `dish-${Date.now().toString(36)}`;
}

export function uniqueSlug(base: string, taken: Set<string>) {
  if (!taken.has(base)) return base;
  for (let i = 2; i < 1000; i += 1) {
    const next = `${base}-${i}`;
    if (!taken.has(next)) return next;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export function normalizePrice(raw: string) {
  const value = raw.trim().replace(/\s+/g, "").replace(".", ",");
  if (!/^\d+(,\d{1,2})?$/.test(value)) return "";
  if (!value.includes(",")) return `${value},00`;
  const [whole, frac = ""] = value.split(",");
  return `${whole},${frac.padEnd(2, "0").slice(0, 2)}`;
}

export function normalizeWeight(raw: string) {
  const value = raw.trim().replace(",", ".");
  if (!value) return "";
  const digits = value.match(/^(\d+(?:\.\d+)?)\s*(г|гр|g)?$/i);
  if (digits) return `${digits[1].replace(".", ",")} г`.replace(", г", " г");
  return value.slice(0, 24);
}

export function isSafeDishId(id: string) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id) && id.length <= 80;
}
