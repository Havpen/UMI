"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { asset } from "@/lib/asset";
import type { HallCategory, HallDish, MenuCategoryId } from "@/lib/hallMenuShared";

type Draft = {
  id: string | null;
  name: string;
  price: string;
  weight: string;
  description: string;
  category: MenuCategoryId;
  image?: string;
};

const emptyDraft = (category: MenuCategoryId): Draft => ({
  id: null,
  name: "",
  price: "",
  weight: "",
  description: "",
  category,
  image: undefined,
});

const VIEW_KEY = "umi-admin-view";

type AdminView = { category?: string; dishId?: string | null };

function readAdminView(): AdminView {
  if (typeof window === "undefined") return {};
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = {
      category: params.get("cat") || undefined,
      dishId: params.get("dish") || undefined,
    };
    const raw = sessionStorage.getItem(VIEW_KEY);
    const stored = raw ? (JSON.parse(raw) as AdminView) : {};
    return {
      category: fromUrl.category || stored.category,
      dishId: fromUrl.dishId || stored.dishId || null,
    };
  } catch {
    return {};
  }
}

function persistAdminView(view: AdminView) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(VIEW_KEY, JSON.stringify(view));
    const url = new URL(window.location.href);
    if (view.category) url.searchParams.set("cat", view.category);
    else url.searchParams.delete("cat");
    if (view.dishId) url.searchParams.set("dish", view.dishId);
    else url.searchParams.delete("dish");
    const next = `${url.pathname}${url.search}${url.hash}`;
    if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== next) {
      window.history.replaceState(null, "", next);
    }
  } catch {
    /* ignore quota / private mode */
  }
}

function draftFromDish(dish: HallDish): Draft {
  return {
    id: dish.id,
    name: dish.name,
    price: dish.price,
    weight: dish.weight ?? "",
    description: dish.description ?? "",
    category: dish.category,
    image: dish.image,
  };
}

async function readApi<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, { ...init, cache: "no-store" });
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || "Не получилось");
  }
  return data;
}

function fileFromClipboard(event: ClipboardEvent) {
  const items = event.clipboardData?.items;
  if (!items) return null;
  for (const item of items) {
    if (item.type.startsWith("image/")) return item.getAsFile();
  }
  return null;
}

export function AdminMenu() {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [password, setPassword] = useState("");
  const [dishes, setDishes] = useState<HallDish[]>([]);
  const [categories, setCategories] = useState<HallCategory[]>([]);
  const [category, setCategory] = useState<MenuCategoryId>("starters");
  const [newCategory, setNewCategory] = useState("");
  const [draft, setDraft] = useState<Draft>(() => emptyDraft("starters"));
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [stamp, setStamp] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const viewReady = useRef(false);

  const grouped = useMemo(() => {
    const map = new Map<MenuCategoryId, HallDish[]>();
    for (const cat of categories) map.set(cat.id, []);
    for (const dish of dishes) {
      if (!map.has(dish.category)) map.set(dish.category, []);
      map.get(dish.category)?.push(dish);
    }
    return map;
  }, [dishes, categories]);

  const visible = grouped.get(category) ?? [];

  const load = useCallback(async () => {
    const data = await readApi<{ dishes: HallDish[]; categories: HallCategory[] }>("/api/admin/dishes");
    setDishes(data.dishes);
    setCategories(data.categories);
    const saved = viewReady.current ? null : readAdminView();
    setCategory((prev) => {
      const wanted = saved?.category || prev;
      if (data.categories.some((item) => item.id === wanted)) return wanted;
      return data.categories[0]?.id ?? prev;
    });
    if (!viewReady.current) {
      viewReady.current = true;
      const dish = saved?.dishId ? data.dishes.find((item) => item.id === saved.dishId) : undefined;
      if (dish) {
        setDraft(draftFromDish(dish));
        setCategory(dish.category);
      }
    }
  }, []);

  useEffect(() => {
    let gone = false;
    readApi<{ ok: boolean; configured: boolean }>("/api/admin/session")
      .then(async (session) => {
        if (gone) return;
        setConfigured(session.configured);
        setAuthed(session.ok);
        if (session.ok) await load();
      })
      .catch(() => {
        if (!gone) setConfigured(false);
      })
      .finally(() => {
        if (!gone) setReady(true);
      });
    return () => {
      gone = true;
    };
  }, [load]);

  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  useEffect(() => {
    function onPaste(event: ClipboardEvent) {
      const next = fileFromClipboard(event);
      if (!next) return;
      event.preventDefault();
      setFile(next);
      setNotice("Картинка из буфера");
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  useEffect(() => {
    if (!viewReady.current || !authed) return;
    persistAdminView({ category, dishId: draft.id });
  }, [authed, category, draft.id]);

  function openNew() {
    setDraft(emptyDraft(category));
    setFile(null);
    setError("");
    setNotice("");
  }

  function openEdit(dish: HallDish) {
    setDraft(draftFromDish(dish));
    setFile(null);
    setStamp(Date.now());
    setError("");
    setNotice("");
  }

  function takeFile(next: File | null) {
    if (!next) return;
    setFile(next);
    setNotice("");
  }

  async function onLogin(event: FormEvent) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await readApi("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      setAuthed(true);
      setPassword("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неверный пароль");
    } finally {
      setBusy(false);
    }
  }

  async function onLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAuthed(false);
    setDishes([]);
    openNew();
  }

  async function uploadImage(id: string, imageFile: File) {
    const body = new FormData();
    body.set("file", imageFile);
    const data = await readApi<{ dish: HallDish }>(`/api/admin/dishes/${id}/image`, {
      method: "POST",
      body,
    });
    return data.dish;
  }

  async function onSave(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const payload = {
        name: draft.name,
        price: draft.price,
        weight: draft.weight,
        description: draft.description,
        category: draft.category,
      };
      let saved: HallDish;
      if (draft.id) {
        const data = await readApi<{ dish: HallDish }>(`/api/admin/dishes/${draft.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        saved = data.dish;
      } else {
        const data = await readApi<{ dish: HallDish }>("/api/admin/dishes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        saved = data.dish;
      }
      if (file) {
        saved = await uploadImage(saved.id, file);
        setFile(null);
        setStamp(Date.now());
      }
      await load();
      setDishes((prev) => {
        if (prev.some((item) => item.id === saved.id)) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        const last = prev.findLastIndex((item) => item.category === saved.category);
        if (last === -1) return [...prev, saved];
        return [...prev.slice(0, last + 1), saved, ...prev.slice(last + 1)];
      });
      setDraft({
        id: saved.id,
        name: saved.name,
        price: saved.price,
        weight: saved.weight ?? "",
        description: saved.description ?? "",
        category: saved.category,
        image: saved.image,
      });
      setCategory(saved.category);
      setNotice("Сохранено. На сайте меню обновится после перезагрузки страницы.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не сохранилось");
    } finally {
      setBusy(false);
    }
  }

  async function onMove(id: string, move: "up" | "down") {
    setError("");
    try {
      await readApi(`/api/admin/dishes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ move }),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не сдвинулось");
    }
  }

  async function onDelete(dish: HallDish) {
    if (!window.confirm(`Убрать «${dish.name}» из меню зала?`)) return;
    setError("");
    try {
      await readApi(`/api/admin/dishes/${dish.id}`, { method: "DELETE" });
      if (draft.id === dish.id) openNew();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалилось");
    }
  }

  async function onAddCategory(event: FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const data = await readApi<{ category: HallCategory }>("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newCategory }),
      });
      setNewCategory("");
      await load();
      setCategory(data.category.id);
      setDraft(emptyDraft(data.category.id));
      setNotice("Категория добавлена. Обновите страницу меню, чтобы увидеть её на сайте.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Категория не создалась");
    } finally {
      setBusy(false);
    }
  }

  async function onDeleteCategory() {
    const cat = categories.find((item) => item.id === category);
    if (!cat) return;
    if ((grouped.get(category) ?? []).length > 0) {
      setError("Сначала уберите блюда из категории");
      return;
    }
    if (!window.confirm(`Удалить категорию «${cat.title}»?`)) return;
    setError("");
    try {
      await readApi(`/api/admin/categories/${cat.id}`, { method: "DELETE" });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Категория не удалилась");
    }
  }

  const photo = preview || (draft.image ? `${asset(draft.image)}?v=${stamp || 1}` : "");

  if (!ready) {
    return (
      <main className="admin-shell">
        <p className="text-ink-soft">Открываю…</p>
      </main>
    );
  }

  if (!configured) {
    return (
      <main className="admin-shell">
        <h1 className="font-serif text-3xl">Админка меню</h1>
        <p className="mt-4 max-w-xl text-ink-soft">
          В `.env.local` добавьте строку `ADMIN_PASSWORD=ваш-пароль` и перезапустите `npx next
          dev`.
        </p>
      </main>
    );
  }

  if (!authed) {
    return (
      <main className="admin-shell">
        <h1 className="font-serif text-3xl">Меню зала</h1>
        <p className="mt-3 max-w-md text-ink-soft">Пароль из `.env.local`, не для гостей сайта.</p>
        <form className="mt-8 max-w-sm space-y-4" onSubmit={onLogin}>
          <label className="block text-left text-sm text-ink-soft">
            Пароль
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="admin-input mt-1"
            />
          </label>
          {error ? <p className="text-sm text-red-800">{error}</p> : null}
          <button type="submit" className="admin-btn" disabled={busy}>
            Войти
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm tracking-[0.18em] text-ink-soft">UMI</p>
          <h1 className="mt-1 font-serif text-3xl md:text-4xl">Меню зала</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href="/menu" className="admin-btn-ghost">
            Смотреть сайт
          </a>
          <button type="button" className="admin-btn-ghost" onClick={onLogout}>
            Выйти
          </button>
        </div>
      </header>

      <div className="admin-tabs" role="tablist" aria-label="Категории">
        {categories.map((cat) => {
          const count = grouped.get(cat.id)?.length ?? 0;
          return (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={category === cat.id}
              className={`admin-tab${category === cat.id ? " is-on" : ""}`}
              onClick={() => {
                setCategory(cat.id);
                if (!draft.id) setDraft((prev) => ({ ...prev, category: cat.id }));
              }}
            >
              {cat.title}
              <span>{count}</span>
            </button>
          );
        })}
      </div>
      <form className="admin-cat-add" onSubmit={onAddCategory}>
        <input
          value={newCategory}
          onChange={(event) => setNewCategory(event.target.value)}
          placeholder="Новая категория"
          className="admin-input"
          aria-label="Название новой категории"
        />
        <button type="submit" className="admin-btn" disabled={busy || !newCategory.trim()}>
          Добавить
        </button>
        {visible.length === 0 && categories.some((item) => item.id === category) ? (
          <button type="button" className="admin-btn-ghost" onClick={onDeleteCategory}>
            Удалить пустую
          </button>
        ) : null}
      </form>

      <div className="admin-layout">
        <section>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg">В категории</h2>
            <button type="button" className="admin-btn" onClick={openNew}>
              Новое блюдо
            </button>
          </div>
          {visible.length === 0 ? (
            <p className="rounded-3xl bg-paper-2 px-5 py-8 text-ink-soft">Пока пусто — добавьте блюдо справа.</p>
          ) : (
            <ul className="admin-list">
              {visible.map((dish, index) => (
                <li key={dish.id} className={`admin-row${draft.id === dish.id ? " is-on" : ""}`}>
                  <button type="button" className="admin-row-main" onClick={() => openEdit(dish)}>
                    <span className="admin-thumb">
                      {dish.image ? (
                        <img src={`${asset(dish.image)}?v=${stamp || 1}`} alt="" />
                      ) : (
                        <span />
                      )}
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block truncate font-medium">{dish.name}</span>
                      <span className="mt-0.5 block text-sm text-ink-soft">
                        {dish.weight || "без веса"} · {dish.price} Б
                      </span>
                    </span>
                  </button>
                  <span className="admin-row-tools">
                    <button type="button" aria-label="Выше" disabled={index === 0} onClick={() => onMove(dish.id, "up")}>
                      ↑
                    </button>
                    <button
                      type="button"
                      aria-label="Ниже"
                      disabled={index === visible.length - 1}
                      onClick={() => onMove(dish.id, "down")}
                    >
                      ↓
                    </button>
                    <button type="button" aria-label="Удалить" onClick={() => onDelete(dish)}>
                      ×
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <form className="admin-form" onSubmit={onSave}>
          <h2 className="text-lg">{draft.id ? "Карточка" : "Новое блюдо"}</h2>
          <label>
            Название
            <input
              required
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              className="admin-input"
            />
          </label>
          <label>
            Категория
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, category: event.target.value as MenuCategoryId }))
              }
              className="admin-input"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label>
              Цена, Б
              <input
                required
                inputMode="decimal"
                placeholder="33,60"
                value={draft.price}
                onChange={(event) => setDraft((prev) => ({ ...prev, price: event.target.value }))}
                className="admin-input"
              />
            </label>
            <label>
              Вес
              <input
                placeholder="310 г"
                value={draft.weight}
                onChange={(event) => setDraft((prev) => ({ ...prev, weight: event.target.value }))}
                className="admin-input"
              />
            </label>
          </div>
          <label>
            Описание
            <textarea
              rows={5}
              value={draft.description}
              onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
              className="admin-input min-h-[8rem] resize-y"
            />
          </label>
          <div>
            <p className="mb-2 text-sm text-ink-soft">Фото</p>
            <button
              type="button"
              className="admin-drop"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                takeFile(event.dataTransfer.files[0] ?? null);
              }}
            >
              {photo ? <img src={photo} alt="" /> : <span>Файл с устройства, перетащите сюда или Ctrl+V</span>}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/*"
              hidden
              onChange={(event) => takeFile(event.target.files?.[0] ?? null)}
            />
          </div>
          {error ? <p className="text-sm text-red-800">{error}</p> : null}
          {notice ? <p className="text-sm text-ink-soft">{notice}</p> : null}
          <button type="submit" className="admin-btn w-full" disabled={busy}>
            {busy ? "Сохраняю…" : "Сохранить"}
          </button>
        </form>
      </div>
    </main>
  );
}
