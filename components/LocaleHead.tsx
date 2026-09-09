"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { pageSeo, useCopy } from "@/lib/i18n";
import { useLocale } from "@/lib/locale";
import { isAdminPath, normPath } from "@/lib/paths";
import { menuCategories } from "@/lib/content";

export function LocaleHead() {
  const pathname = normPath(usePathname());
  const { locale } = useLocale();
  const t = useCopy();

  useEffect(() => {
    if (isAdminPath(pathname)) return;
    const category = menuCategories.find((item) => item.href === pathname);
    const seo = pageSeo(pathname, locale, category);
    document.title = seo.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", seo.description);
  }, [pathname, locale, t]);

  return null;
}
