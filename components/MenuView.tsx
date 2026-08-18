"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type MouseEvent } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isMenuPath, sectionFromPath } from "@/lib/menuSection";
import { navHref } from "@/lib/paths";

const MenuViewContext = createContext<{
  section: string;
  openMenu: (id: string, href: string) => void;
} | null>(null);

export function MenuViewProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [section, setSection] = useState(() => sectionFromPath(pathname));

  useEffect(() => {
    setSection(sectionFromPath(pathname));
  }, [pathname]);

  const openMenu = useCallback(
    (id: string, href: string) => {
      setSection(id);
      router.push(navHref(href), { scroll: false });
    },
    [router],
  );

  const value = useMemo(() => ({ section, openMenu }), [section, openMenu]);

  return <MenuViewContext.Provider value={value}>{children}</MenuViewContext.Provider>;
}

export function useMenuView() {
  return useContext(MenuViewContext);
}

export function useMenuJump() {
  const menu = useMenuView();
  const pathname = usePathname();

  return (href: string, event?: MouseEvent) => {
    if (!menu || !isMenuPath(href) || !isMenuPath(pathname)) return false;
    event?.preventDefault();
    menu.openMenu(sectionFromPath(href), href);
    return true;
  };
}
