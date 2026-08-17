"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Hit } from "@/lib/content";
import { track } from "./booking";

export type CartItem = {
  id: string;
  name: string;
  price: string;
  qty: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (hit: Pick<Hit, "id" | "name" | "price">) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  qty: (id: string) => number;
  count: number;
  sumLabel: string;
  panelOpen: boolean;
  setPanelOpen: (next: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (next: boolean) => void;
};

const STORAGE_KEY = "umi-takeaway-cart";
const CartContext = createContext<CartContextValue | null>(null);

export function parsePrice(price: string) {
  return Number.parseFloat(price.replace(",", "."));
}

export function formatSum(value: number) {
  return value.toFixed(2).replace(".", ",");
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  useEffect(() => {
    if (items.length === 0) setPanelOpen(false);
  }, [items.length]);

  const value = useMemo<CartContextValue>(() => {
    const count = items.reduce((sum, item) => sum + item.qty, 0);
    const sum = items.reduce((total, item) => total + parsePrice(item.price) * item.qty, 0);
    return {
      items,
      add: (hit) => {
        setItems((prev) => {
          const found = prev.find((item) => item.id === hit.id);
          if (found) {
            return prev.map((item) => (item.id === hit.id ? { ...item, qty: item.qty + 1 } : item));
          }
          return [...prev, { id: hit.id, name: hit.name, price: hit.price, qty: 1 }];
        });
        track("takeaway_add", { dish: hit.id });
      },
      inc: (id) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty: item.qty + 1 } : item)));
      },
      dec: (id) => {
        setItems((prev) =>
          prev
            .map((item) => (item.id === id ? { ...item, qty: item.qty - 1 } : item))
            .filter((item) => item.qty > 0),
        );
      },
      remove: (id) => setItems((prev) => prev.filter((item) => item.id !== id)),
      clear: () => setItems([]),
      qty: (id) => items.find((item) => item.id === id)?.qty ?? 0,
      count,
      sumLabel: formatSum(sum),
      panelOpen,
      setPanelOpen,
      checkoutOpen,
      setCheckoutOpen,
    };
  }, [items, panelOpen, checkoutOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
