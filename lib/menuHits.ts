import type { Hit } from "./content";

const HITS_SKIP = new Set(["sousy", "napitki"]);

export function pickMenuHits(
  dishes: Hit[],
  categories: { id: string }[],
): Hit[] {
  const picked: Hit[] = [];
  for (const cat of categories) {
    if (HITS_SKIP.has(cat.id)) continue;
    const inCat = dishes.filter((dish) => dish.category === cat.id);
    const hit = inCat.find((dish) => dish.image) ?? inCat[0];
    if (hit) picked.push(hit);
  }
  return picked;
}
