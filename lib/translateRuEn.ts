function hasCyrillic(text: string) {
  return /[а-яё]/i.test(text);
}

function parseGoogleGtx(data: unknown): string | null {
  if (!Array.isArray(data) || !Array.isArray(data[0])) return null;
  const text = data[0]
    .map((part) => (Array.isArray(part) && typeof part[0] === "string" ? part[0] : ""))
    .join("");
  return text.trim() || null;
}

async function translateGoogle(text: string): Promise<string | null> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  return parseGoogleGtx(await res.json());
}

async function translateMyMemory(text: string): Promise<string | null> {
  const url = `https://api.mymemory.translated.net/get?langpair=ru|en&q=${encodeURIComponent(text.slice(0, 500))}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) return null;
  const json = (await res.json()) as { responseData?: { translatedText?: string } };
  const out = String(json.responseData?.translatedText ?? "").trim();
  if (!out || /INVALID/i.test(out)) return null;
  return out;
}

export async function translateRuEn(text: string): Promise<string | null> {
  const source = text.trim().slice(0, 900);
  if (!source) return null;
  if (!hasCyrillic(source)) return source;
  try {
    const google = await translateGoogle(source);
    if (google && !hasCyrillic(google)) return google;
  } catch {
    /* fallback */
  }
  try {
    const memory = await translateMyMemory(source);
    if (memory && !hasCyrillic(memory)) return memory;
  } catch {
    /* keep Russian */
  }
  return null;
}

export async function englishForDish(name: string, description: string) {
  const [nameEn, descriptionEn] = await Promise.all([
    translateRuEn(name),
    description ? translateRuEn(description) : Promise.resolve(null),
  ]);
  return {
    nameEn: nameEn ?? undefined,
    descriptionEn: descriptionEn ?? undefined,
  };
}

export async function englishForCategory(title: string, h1: string) {
  const [titleEn, h1En] = title === h1
    ? await translateRuEn(title).then((value) => [value, value] as const)
    : await Promise.all([translateRuEn(title), translateRuEn(h1)]);
  return {
    titleEn: titleEn ?? undefined,
    h1En: h1En ?? undefined,
  };
}
