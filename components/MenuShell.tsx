"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { brunch, dishAlt, dishPhoto, dishesInCategory, hits, lunch, menuCategories, type Hit, type MenuCategoryId } from "@/lib/content";
import { asset } from "@/lib/asset";
import { DishActions } from "./DishActions";
import { useMenuView } from "./MenuView";
import { MenuPageHeader } from "./MenuPageHeader";
import { Price } from "./BynSign";

function DishCard({
  hit,
  open,
  onToggle,
}: {
  hit: Hit;
  open: boolean;
  onToggle: () => void;
}) {
  const hasDesc = Boolean(hit.description);
  const cardRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (open) {
      wasOpen.current = true;
      setClosing(false);
      return;
    }
    if (!wasOpen.current || !el) return;
    wasOpen.current = false;
    setClosing(true);
    const done = window.setTimeout(() => {
      el.style.height = "";
      setClosing(false);
    }, 300);
    return () => window.clearTimeout(done);
  }, [open]);

  function toggle() {
    const el = cardRef.current;
    if (!open && el) el.style.height = `${el.offsetHeight}px`;
    onToggle();
  }

  return (
    <div
      ref={cardRef}
      className={`dish-card${open ? " is-open" : ""}${closing ? " is-closing" : ""}${hasDesc ? " has-desc" : ""}`}
      onClick={(event) => {
        if (!hasDesc) return;
        if ((event.target as HTMLElement).closest(".dish-card-add, [data-qty]")) return;
        toggle();
      }}
    >
      <article id={hit.id} className="dish-card-face">
        <div className="dish-card-shot">
          <img src={asset(dishPhoto(hit))} alt={dishAlt(hit.name)} draggable={false} />
        </div>
        <div className="dish-card-copy">
          <p className="dish-card-name font-serif leading-tight md:text-xl">{hit.name}</p>
          {hasDesc ? (
            <button
              type="button"
              className="dish-card-chevron"
              aria-expanded={open}
              aria-label={open ? "Скрыть состав" : "Показать состав"}
              onClick={(event) => {
                event.stopPropagation();
                toggle();
              }}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7">
                <path d="M3.5 6.25 8 10.75l4.5-4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <span className="dish-card-chevron" aria-hidden />
          )}
          {hasDesc ? (
            <div className="dish-card-desc">
              <p className="pt-2 text-center text-sm font-medium leading-snug text-ink-soft">{hit.description}</p>
            </div>
          ) : null}
          <div className="dish-card-foot">
            <p className="dish-card-weight text-sm text-ink-soft">{hit.weight || "\u00a0"}</p>
            <Price value={hit.price} />
            <div className="w-full pt-2">
              <DishActions id={hit.id} name={hit.name} price={hit.price} />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

export function MenuShell() {
  const router = useRouter();
  const menu = useMenuView();
  const current = menu?.section ?? "hits";
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    document.querySelector("main")?.classList.remove("page-leave");
  }, [current]);

  useEffect(() => {
    setOpenId(null);
  }, [current]);

  useEffect(() => {
    if (!openId) return;
    const close = (event: PointerEvent) => {
      if ((event.target as HTMLElement).closest(".dish-card")) return;
      setOpenId(null);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [openId]);

  useEffect(() => {
    router.prefetch("/menu");
    router.prefetch("/lunch");
    router.prefetch("/brunch");
    router.prefetch("/delivery");
    router.prefetch("/contacts");
    for (const cat of menuCategories) router.prefetch(cat.href);
  }, [router]);

  function select(id: string, href: string) {
    menu?.openMenu(id, href);
  }

  const cat = menuCategories.find((item) => item.id === current);
  const title =
    current === "lunch" ? "Бизнес-ланч" : current === "brunch" ? "Бранч" : (cat?.h1 ?? "Меню");
  const tabCurrent = current === "hits" ? undefined : current;
  const dishes = current === "hits" ? hits : dishesInCategory(current as MenuCategoryId);
  const isLunch = current === "lunch";
  const isBrunch = current === "brunch";

  return (
    <main className="menu-fade relative page-shell pb-20 pt-24 text-center">
      <MenuPageHeader
        title={title}
        current={tabCurrent}
        onSelect={select}
      />
      <div className="menu-fade-section">
        {!isLunch && !isBrunch ? (
          <p className="mx-auto mt-8 max-w-xl text-ink-soft">
            Добавьте блюда — в шапке появится корзина. Это заявка на вынос, не заказ: подтвердим по телефону.
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
            {dishes.map((hit) => (
              <DishCard
                key={hit.id}
                hit={hit}
                open={openId === hit.id}
                onToggle={() => setOpenId((prev) => (prev === hit.id ? null : hit.id))}
              />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
