import { menuCategories } from "@/lib/content";
import { normPath } from "@/lib/paths";

export function isMenuPath(pathname: string) {
  const path = normPath(pathname);
  return path === "/menu" || path.startsWith("/menu/") || path === "/lunch" || path === "/brunch";
}

export function sectionFromPath(pathname: string) {
  const path = normPath(pathname);
  if (path === "/lunch") return "lunch";
  if (path === "/brunch") return "brunch";
  if (path === "/menu") return "hits";
  return menuCategories.find((item) => item.href === path)?.id ?? "";
}
