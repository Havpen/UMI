import type { Hit } from "./content";
import type { HallCategory, HallDish } from "./hallMenuShared";
import { readHallCategories, readHallMenu } from "./hallMenuStore";

export function asHits(dishes: HallDish[]): Hit[] {
  return dishes.map((dish) => ({
    ...dish,
    href: `/menu/${dish.category}#${dish.id}`,
  }));
}

export function withCategoryHrefs(categories: HallCategory[]) {
  return categories.map((cat) => ({
    ...cat,
    href: `/menu/${cat.id}`,
  }));
}

export function dishesInList(dishes: Hit[], id: string) {
  return dishes.filter((dish) => dish.category === id);
}

export async function getPublicMenu() {
  const [rawDishes, rawCategories] = await Promise.all([readHallMenu(), readHallCategories()]);
  const hits = asHits(rawDishes);
  const menuCategories = withCategoryHrefs(rawCategories);
  const publicCategories = menuCategories.filter((cat) => hits.some((dish) => dish.category === cat.id));
  return { hits, menuCategories, publicCategories };
}

