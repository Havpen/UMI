"use client";

import { useCart } from "./cart";

export function DishActions({
  id,
  name,
  price,
}: {
  id: string;
  name: string;
  price: string;
}) {
  const { add, inc, dec, qty } = useCart();
  const count = qty(id);

  if (count === 0) {
    return (
      <button
        type="button"
        className="dish-card-add"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          add({ id, name, price });
        }}
      >
        <span>Добавить</span>
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
        aria-label="Меньше"
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
        aria-label="Больше"
      >
        +
      </button>
    </div>
  );
}
