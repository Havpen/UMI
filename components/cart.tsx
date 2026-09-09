"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Hit } from "@/lib/content";
import { isSafeDishId } from "@/lib/hallMenuShared";
import { formatSum, parsePrice } from "@/lib/money";
import { track } from "./booking";

export type CartItem = {
  id: string;
  name: string;
  nameEn?: string;
  price: string;
  qty: number;
  image?: string;
};

export { formatSum, parsePrice };

const MAX_QTY = 20;
const MAX_LINES = 40;

function sanitizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  const out: CartItem[] = [];
  for (const row of raw.slice(0, MAX_LINES)) {
    if (!row || typeof row !== "object") continue;
    const item = row as CartItem;
    const id = String(item.id ?? "");
    if (!isSafeDishId(id)) continue;
    const qty = Number(item.qty);
    if (!Number.isInteger(qty) || qty < 1) continue;
    const image = typeof item.image === "string" && item.image.startsWith("/media/") ? item.image : undefined;
    out.push({
      id,
      name: String(item.name ?? "").slice(0, 140),
      nameEn: item.nameEn ? String(item.nameEn).slice(0, 140) : undefined,
      price: String(item.price ?? "").slice(0, 16),
      qty: Math.min(qty, MAX_QTY),
      image,
    });
  }
  return out;
}

type CartContextValue = {
  items: CartItem[];
  add: (hit: Pick<Hit, "id" | "name" | "price" | "image" | "nameEn">) => void;
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

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setItems(sanitizeCart(JSON.parse(raw)));
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
            return prev.map((item) =>
              item.id === hit.id ? { ...item, qty: Math.min(MAX_QTY, item.qty + 1) } : item,
            );
          }
          if (prev.length >= MAX_LINES) return prev;
          return [...prev, { id: hit.id, name: hit.name, nameEn: hit.nameEn, price: hit.price, qty: 1, image: hit.image }];
        });
        track("takeaway_add", { dish: hit.id });
      },
      inc: (id) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, qty: Math.min(MAX_QTY, item.qty + 1) } : item)));
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
