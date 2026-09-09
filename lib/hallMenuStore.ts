import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  type HallCategory,
  type HallDish,
  type MenuCategoryId,
  RESERVED_CATEGORY_IDS,
  isSafeDishId,
  normalizePrice,
  normalizeWeight,
  slugifyName,
  uniqueSlug,
} from "./hallMenuShared";
import { englishForCategory, englishForDish } from "./translateRuEn";

const menuPath = () => path.join(process.cwd(), "lib", "hallMenu.json");
const categoriesPath = () => path.join(process.cwd(), "lib", "hallCategories.json");
const dishesDir = () => path.join(process.cwd(), "public", "media", "dishes");

type FileCache<T> = { mtimeMs: number; data: T };
let menuCache: FileCache<HallDish[]> | null = null;
let categoryCache: FileCache<HallCategory[]> | null = null;

let writeChain = Promise.resolve();

function withLock<T>(fn: () => Promise<T>) {
  const run = writeChain.then(fn, fn);
  writeChain = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

export async function readHallMenu(): Promise<HallDish[]> {
  const mtimeMs = (await stat(menuPath())).mtimeMs;
  if (menuCache && menuCache.mtimeMs === mtimeMs) return menuCache.data;
  const raw = await readFile(menuPath(), "utf8");
  const parsed = JSON.parse(raw) as HallDish[];
  if (!Array.isArray(parsed)) throw new Error("Меню повреждено");
  menuCache = { mtimeMs, data: parsed };
  return parsed;
}

async function writeHallMenu(dishes: HallDish[]) {
  await writeFile(menuPath(), `${JSON.stringify(dishes, null, 2)}\n`, "utf8");
  menuCache = { mtimeMs: (await stat(menuPath())).mtimeMs, data: dishes };
}

export async function readHallCategories(): Promise<HallCategory[]> {
  const mtimeMs = (await stat(categoriesPath())).mtimeMs;
  if (categoryCache && categoryCache.mtimeMs === mtimeMs) return categoryCache.data;
  const raw = await readFile(categoriesPath(), "utf8");
  const parsed = JSON.parse(raw) as HallCategory[];
  if (!Array.isArray(parsed)) throw new Error("Категории повреждены");
  categoryCache = { mtimeMs, data: parsed };
  return parsed;
}

async function writeHallCategories(categories: HallCategory[]) {
  await writeFile(categoriesPath(), `${JSON.stringify(categories, null, 2)}\n`, "utf8");
  categoryCache = { mtimeMs: (await stat(categoriesPath())).mtimeMs, data: categories };
}

export type DishInput = {
  name: string;
  price: string;
  weight: string;
  description: string;
  category: string;
};

type ParsedDish = {
  name: string;
  price: string;
  weight: string;
  description: string;
  category: MenuCategoryId;
};

export function parseDishInput(
  body: Partial<DishInput>,
  categoryIds: Set<string>,
): ParsedDish | { error: string } {
  const name = String(body.name ?? "").trim();
  const description = String(body.description ?? "").trim();
  const category = String(body.category ?? "").trim();
  const price = normalizePrice(String(body.price ?? ""));
  const weight = normalizeWeight(String(body.weight ?? ""));
  if (!name) return { error: "Нужно название" as const };
  if (name.length > 140) return { error: "Название слишком длинное" as const };
  if (description.length > 900) return { error: "Описание слишком длинное" as const };
  if (!price) return { error: "Цена: например 33,60" as const };
  if (!categoryIds.has(category)) return { error: "Выберите категорию" as const };
  return {
    name,
    price,
    weight,
    description,
    category,
  };
}

function dishImagePath(id: string) {
  return `/media/dishes/${id}.jpg`;
}

export async function createHallDish(input: DishInput): Promise<{ dish: HallDish } | { error: string }> {
  const english = await englishForDish(String(input.name ?? "").trim(), String(input.description ?? "").trim());
  return withLock(async () => {
    const dishes = await readHallMenu();
    const categories = await readHallCategories();
    const parsed = parseDishInput(input, new Set(categories.map((item) => item.id)));
    if ("error" in parsed) return parsed;
    const id = uniqueSlug(
      slugifyName(parsed.name),
      new Set(dishes.map((dish) => dish.id)),
    );
    if (!isSafeDishId(id)) return { error: "Не получилось сделать адрес блюда" as const };
    const dish: HallDish = {
      id,
      name: parsed.name,
      nameEn: english.nameEn,
      price: parsed.price,
      category: parsed.category,
      description: parsed.description || undefined,
      descriptionEn: parsed.description ? english.descriptionEn : undefined,
      weight: parsed.weight || undefined,
    };
    const next = [...dishes];
    const lastInCat = next.findLastIndex((item) => item.category === parsed.category);
    if (lastInCat === -1) next.push(dish);
    else next.splice(lastInCat + 1, 0, dish);
    await writeHallMenu(next);
    return { dish };
  });
}

export async function updateHallDish(
  id: string,
  input: Partial<DishInput> & { move?: "up" | "down" },
): Promise<{ dish: HallDish } | { error: string }> {
  if (!isSafeDishId(id)) return { error: "Неверный id" as const };
  return withLock(async () => {
    const dishes = await readHallMenu();
    const index = dishes.findIndex((dish) => dish.id === id);
    if (index < 0) return { error: "Блюдо не найдено" as const };
    const current = dishes[index];

    if (input.move === "up" || input.move === "down") {
      const same = dishes
        .map((dish, i) => ({ dish, i }))
        .filter((row) => row.dish.category === current.category);
      const pos = same.findIndex((row) => row.i === index);
      const swapWith = input.move === "up" ? same[pos - 1] : same[pos + 1];
      if (!swapWith) return { dish: current };
      const next = [...dishes];
      [next[index], next[swapWith.i]] = [next[swapWith.i], next[index]];
      await writeHallMenu(next);
      return { dish: next[swapWith.i] };
    }

    const parsed = parseDishInput(
      {
        name: input.name ?? current.name,
        price: input.price ?? current.price,
        weight: input.weight ?? current.weight ?? "",
        description: input.description ?? current.description ?? "",
        category: input.category ?? current.category,
      },
      new Set((await readHallCategories()).map((item) => item.id)),
    );
    if ("error" in parsed) return parsed;

    const nameChanged = parsed.name !== current.name;
    const descriptionChanged = (parsed.description || "") !== (current.description ?? "");
    let nameEn = current.nameEn;
    let descriptionEn = parsed.description ? current.descriptionEn : undefined;
    if (nameChanged || descriptionChanged || !nameEn || (parsed.description && !descriptionEn)) {
      const english = await englishForDish(parsed.name, parsed.description);
      if (nameChanged || !nameEn) nameEn = english.nameEn ?? nameEn;
      if (!parsed.description) descriptionEn = undefined;
      else if (descriptionChanged || !descriptionEn) descriptionEn = english.descriptionEn ?? descriptionEn;
    }

    const updated: HallDish = {
      ...current,
      name: parsed.name,
      nameEn,
      price: parsed.price,
      weight: parsed.weight || undefined,
      description: parsed.description || undefined,
      descriptionEn,
      category: parsed.category,
    };
    const without = dishes.filter((dish) => dish.id !== id);
    if (parsed.category === current.category) {
      without.splice(index, 0, updated);
      await writeHallMenu(without);
      return { dish: updated };
    }
    const lastInCat = without.findLastIndex((item) => item.category === parsed.category);
    if (lastInCat === -1) without.push(updated);
    else without.splice(lastInCat + 1, 0, updated);
    await writeHallMenu(without);
    return { dish: updated };
  });
}

export async function deleteHallDish(id: string) {
  if (!isSafeDishId(id)) return { error: "Неверный id" as const };
  return withLock(async () => {
    const dishes = await readHallMenu();
    const next = dishes.filter((dish) => dish.id !== id);
    if (next.length === dishes.length) return { error: "Блюдо не найдено" as const };
    await writeHallMenu(next);
    return { ok: true as const };
  });
}

export async function attachHallDishImage(
  id: string,
  buffer: Buffer,
): Promise<{ dish: HallDish } | { error: string }> {
  if (!isSafeDishId(id)) return { error: "Неверный id" as const };
  const { compressDishJpeg } = await import("./compressDishImage");
  return withLock(async () => {
    const dishes = await readHallMenu();
    const index = dishes.findIndex((dish) => dish.id === id);
    if (index < 0) return { error: "Сначала сохраните блюдо" as const };
    const dir = path.resolve(dishesDir());
    await mkdir(dir, { recursive: true });
    const dest = path.resolve(dir, `${id}.jpg`);
    const rel = path.relative(dir, dest);
    if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) return { error: "Неверный id" as const };
    await compressDishJpeg(buffer, dest);
    const image = dishImagePath(id);
    if (dishes[index].image !== image) {
      const next = [...dishes];
      next[index] = { ...next[index], image };
      await writeHallMenu(next);
    }
    return { dish: { ...dishes[index], image } };
  });
}

export async function createHallCategory(titleRaw: string, h1Raw?: string) {
  const title = titleRaw.trim();
  const h1 = (h1Raw ?? title).trim() || title;
  if (!title) return { error: "Нужно название категории" as const };
  if (title.length > 60) return { error: "Название слишком длинное" as const };
  if (h1.length > 80) return { error: "Заголовок слишком длинный" as const };
  const english = await englishForCategory(title, h1);
  return withLock(async () => {
    const categories = await readHallCategories();
    const taken = new Set([
      ...RESERVED_CATEGORY_IDS,
      ...categories.map((item) => item.id),
    ]);
    const id = uniqueSlug(slugifyName(title), taken);
    if (!isSafeDishId(id) || RESERVED_CATEGORY_IDS.has(id)) {
      return { error: "Не получилось сделать адрес категории" as const };
    }
    const category: HallCategory = {
      id,
      title,
      h1,
      titleEn: english.titleEn,
      h1En: english.h1En,
    };
    await writeHallCategories([...categories, category]);
    return { category };
  });
}

export async function deleteHallCategory(id: string) {
  if (!isSafeDishId(id)) return { error: "Неверный id" as const };
  return withLock(async () => {
    const categories = await readHallCategories();
    if (!categories.some((item) => item.id === id)) return { error: "Категория не найдена" as const };
    const dishes = await readHallMenu();
    if (dishes.some((dish) => dish.category === id)) {
      return { error: "Сначала уберите блюда из категории" as const };
    }
    await writeHallCategories(categories.filter((item) => item.id !== id));
    return { ok: true as const };
  });
}
