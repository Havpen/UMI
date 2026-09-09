export function normPath(pathname: string) {
  if (!pathname) return "/";
  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

export function isAdminPath(pathname: string) {
  const path = normPath(pathname);
  return path === "/admin" || path.startsWith("/admin/");
}

export function navHref(href: string) {
  const [path, query] = href.split("?");
  const clean = path.replace(/\/+$/, "") || "/";
  const withSlash =
    process.env.NEXT_PUBLIC_BASE_PATH && clean !== "/" ? `${clean}/` : clean;
  return query ? `${withSlash}?${query}` : withSlash;
}
