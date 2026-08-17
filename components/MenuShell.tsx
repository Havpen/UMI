"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { brunch, hits, lunch, menuCategories, type Hit } from "@/lib/content";
import { asset } from "@/lib/asset";
import { DishActions } from "./DishActions";
import { MenuPageHeader } from "./MenuPageHeader";
import { Price } from "./BynSign";
import { shouldSoftClick } from "./softNav";

function sectionFromPath(pathname: string) {
  if (pathname === "/lunch") return "lunch";
  if (pathname === "/brunch") return "brunch";
  const cat = menuCategories.find((item) => item.href === pathname);
  return cat?.id ?? "hits";
}

function withTakeaway(href: string, takeaway: boolean) {
  if (!takeaway) return href;
  const [path] = href.split("#");
  return `${path}?mode=takeaway`;
}

function DishCardBody({ hit, takeaway }: { hit: Hit; takeaway: boolean }) {
  return (
    <>
      <div
        className="aspect-[16/10] bg-cover bg-center"
        style={{ backgroundImage: `url(${asset("/media/dish-placeholder.jpg")})` }}
      />
      <div className="flex flex-1 flex-col px-4 py-4">
        <p className="font-serif text-xl">{hit.name}</p>
        <div className="mt-auto pt-3">
          <p>
            <Price value={hit.price} />
          </p>
          {takeaway ? (
            <div className="pt-3">
              <DishActions id={hit.id} name={hit.name} price={hit.price} />
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function MenuShell() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const takeaway = searchParams.get("mode") === "takeaway";
  const [current, setCurrent] = useState(() => sectionFromPath(pathname));

  useEffect(() => {
    setCurrent(sectionFromPath(pathname));
    document.querySelector("main")?.classList.remove("page-leave");
  }, [pathname]);

  useEffect(() => {
    router.prefetch("/menu");
    router.prefetch("/lunch");
    router.prefetch("/brunch");
    for (const cat of menuCategories) router.prefetch(cat.href);
  }, [router]);

  function select(id: string, href: string) {
    setCurrent(id);
    router.push(withTakeaway(href, takeaway), { scroll: false });
  }

  const cat = menuCategories.find((item) => item.id === current);
  const title =
    current === "lunch" ? "Бизнес-ланч" : current === "brunch" ? "Бранч" : (cat?.h1 ?? "Меню");
  const tabCurrent = current === "hits" ? undefined : current;
  const dishes = current === "hits" ? hits : hits.filter((hit) => hit.category === current);
  const isLunch = current === "lunch";
  const isBrunch = current === "brunch";

  return (
    <main className="menu-fade relative page-shell pb-20 pt-24 text-center">
      <MenuPageHeader
        title={title}
        current={tabCurrent}
        menuBack={isLunch || isBrunch}
        takeaway={takeaway}
        onSelect={select}
      />
      <div key={current} className="menu-fade-section">
        {takeaway && !isLunch && !isBrunch ? (
          <p className="mx-auto mt-8 max-w-xl text-ink-soft">
            Добавьте блюда — в шапке появится корзина. Это заявка, не заказ: подтвердим по телефону.
          </p>
        ) : null}
        {isLunch ? (
          <>
            <p className="mx-auto mt-8 max-w-3xl text-lg">{lunch.text}</p>
            <p className="mx-auto mt-8 max-w-3xl text-sm text-ink-soft">
              Состав сета на конкретный день появится, когда пришлют. Пока — часы и формат.
            </p>
          </>
        ) : null}
        {isBrunch ? <p className="mx-auto mt-8 max-w-3xl text-lg">{brunch.text}</p> : null}
        {!isLunch && !isBrunch ? (
          <div className="card-grid mt-8">
            {dishes.map((hit) =>
              current === "hits" ? (
                <Link
                  key={hit.id}
                  id={hit.id}
                  href={withTakeaway(hit.href, takeaway)}
                  className="flex h-full flex-col overflow-hidden rounded-3xl bg-paper-2"
                  onClick={(event) => {
                    if ((event.target as HTMLElement).closest("button")) {
                      event.preventDefault();
                      return;
                    }
                    if (!shouldSoftClick(event)) return;
                    event.preventDefault();
                    const href = menuCategories.find((item) => item.id === hit.category)?.href;
                    if (href) select(hit.category, href);
                  }}
                >
                  <DishCardBody hit={hit} takeaway={takeaway} />
                </Link>
              ) : (
                <article key={hit.id} id={hit.id} className="flex h-full flex-col overflow-hidden rounded-3xl bg-paper-2">
                  <DishCardBody hit={hit} takeaway={takeaway} />
                </article>
              ),
            )}
          </div>
        ) : null}
      </div>
    </main>
  );
}
