"use client";

import { useCart } from "./cart";
import { useCopy } from "@/lib/i18n";

export function DishActions({
  id,
  name,
  nameEn,
  price,
  image,
}: {
  id: string;
  name: string;
  nameEn?: string;
  price: string;
  image?: string;
}) {
  const { add, inc, dec, qty } = useCart();
  const t = useCopy();
  const count = qty(id);

  if (count === 0) {
    return (
      <button
        type="button"
        className="dish-card-add"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          add({ id, name, nameEn, price, image });
        }}
      >
        <span>{t.add}</span>
        <span aria-hidden>+</span>
      </button>
    );
  }

  return (
    <div
      className="flex w-full items-center justify-between rounded-full bg-paper px-1 py-1 text-sm"
      data-qty
      onClick={(event) => event.stopPropagation()}
    >
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          dec(id);
        }}
        aria-label={t.less}
      >
        −
      </button>
      <span className="min-w-6 text-center">{count}</span>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          inc(id);
        }}
        aria-label={t.more}
      >
        +
      </button>
    </div>
  );
}
