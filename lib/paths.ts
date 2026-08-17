export function normPath(pathname: string) {
  if (!pathname) return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function navHref(href: string) {
  const [path, query] = href.split("?");
  const clean = path.replace(/\/+$/, "") || "/";
  const withSlash =
    process.env.NEXT_PUBLIC_BASE_PATH && clean !== "/" ? `${clean}/` : clean;
  return query ? `${withSlash}?${query}` : withSlash;
}
