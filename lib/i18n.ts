import { copy, type Copy, type CopySeoPath } from "./copy";
import { hours } from "./content";
import { CATEGORIES_EN, DISHES_EN, INTERIORS_EN } from "./i18nMenu";
import { useLocale, type Locale } from "./locale";
import type { FieldError } from "./commentModeration";

export function useCopy(): Copy {
  const { locale } = useLocale();
  return copy[locale];
}

export function localizeWeight(weight: string | undefined, locale: Locale) {
  if (!weight) return weight;
  if (locale === "ru") return weight;
  return weight
    .replace(/(\d)\s*г\b/g, "$1 g")
    .replace(/(\d)\s*мл\b/g, "$1 ml")
    .replace(/(\d)\s*л\b/g, "$1 l");
}

export function dishName(id: string, fallback: string, locale: Locale, nameEn?: string) {
  if (locale === "en") return nameEn || DISHES_EN[id]?.name || fallback;
  return fallback;
}

export function localizeDish<
  T extends {
    id: string;
    name: string;
    description?: string;
    weight?: string;
    nameEn?: string;
    descriptionEn?: string;
  },
>(dish: T, locale: Locale): T {
  if (locale === "ru") return dish;
  const canned = DISHES_EN[dish.id];
  return {
    ...dish,
    name: dish.nameEn || canned?.name || dish.name,
    description: dish.descriptionEn || canned?.description || dish.description,
    weight: localizeWeight(dish.weight, locale),
  };
}

export function localizeCategory<T extends { id: string; title: string; h1?: string; titleEn?: string; h1En?: string }>(
  cat: T,
  locale: Locale,
): T {
  if (locale === "ru") return cat;
  const canned = CATEGORIES_EN[cat.id];
  return {
    ...cat,
    title: cat.titleEn || canned?.title || cat.title,
    h1: cat.h1En || canned?.h1 || cat.h1,
  };
}

export function localizeInterior<T extends { src: string; alt: string; title: string; caption: string }>(
  shot: T,
  locale: Locale,
): T {
  if (locale === "ru") return shot;
  const en = INTERIORS_EN[shot.src];
  if (!en) return shot;
  return { ...shot, ...en };
}

export function useHours() {
  const t = useCopy();
  return hours.map((row, index) => ({ ...row, days: t.hoursDays[index] ?? row.days }));
}

export function fieldMessage(code: string | undefined, t: Copy, fallback: string) {
  if (!code) return fallback;
  return t.err[code as FieldError] ?? fallback;
}

export function pageSeo(pathname: string, locale: Locale, category?: { id: string; title: string; h1: string }) {
  const t = copy[locale];
  const known = t.seo[pathname as CopySeoPath];
  if (known) return known;
  if (pathname.startsWith("/menu/") && category) {
    const localized = localizeCategory(category, locale);
    return {
      title: t.categorySeoTitle(localized.h1 ?? localized.title),
      description: t.categorySeoDescription(localized.title),
    };
  }
  return t.seo["/"];
}
