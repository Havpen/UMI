/** Проверка комментариев заявок: маты и ссылки. Алгоритм как в Strekoza. */

const LINK_RE =
  /(?:https?:\/\/|www\.|t\.me\/|vk\.com\/|instagram\.com\/|wa\.me\/|bit\.ly\/)|(?:[a-z0-9-]+\.)+(?:com|ru|by|net|org|info|me|cc|xyz|online|site|shop)\b/i;

const PROFANITY_STEMS = [
  "бля",
  "бляд",
  "блят",
  "еба",
  "ебан",
  "ебат",
  "ебл",
  "ебу",
  "еби",
  "еблан",
  "пизд",
  "пезд",
  "хуй",
  "хуе",
  "хуя",
  "хер",
  "хрен",
  "муда",
  "мудил",
  "сука",
  "сучк",
  "гандон",
  "гондон",
  "залуп",
  "дроч",
  "перд",
  "срат",
  "говн",
  "дерьм",
  "пидор",
  "пидар",
  "педик",
  "чмо",
  "долбо",
  "уеб",
  "выеб",
  "охуе",
  "охере",
  "нахер",
  "нахуй",
  "похуй",
  "похер",
  "спизд",
  "выпизд",
  "хуйло",
  "хуйл",
  "шалав",
  "шлюх",
  "епта",
  "епть",
  "йопта",
  "ебта",
  "fuck",
  "shit",
  "bitch",
  "asshole",
  "dick",
  "cunt",
];

const LOOKALIKE_SINGLE: Record<string, string> = {
  "0": "о",
  "5": "с",
  "6": "б",
  "9": "д",
  a: "а",
  b: "б",
  c: "с",
  e: "е",
  g: "г",
  h: "н",
  i: "и",
  k: "к",
  l: "л",
  m: "м",
  n: "п",
  o: "о",
  p: "р",
  s: "с",
  t: "т",
  u: "у",
  v: "в",
  w: "ш",
  x: "х",
  y: "у",
  z: "з",
  "@": "а",
  $: "с",
  "*": "",
  "€": "е",
  "£": "е",
  "¥": "у",
  "†": "т",
  "‡": "т",
  α: "а",
  β: "б",
  ε: "е",
  ι: "и",
  κ: "к",
  ο: "о",
  ρ: "р",
  τ: "т",
  υ: "у",
  χ: "х",
  а: "а",
  ɑ: "а",
  "а̀": "а",
  "е́": "е",
  і: "и",
  ї: "и",
  є: "е",
  ґ: "г",
};

const LOOKALIKE_AMBIGUOUS: Record<string, string[]> = {
  "1": ["и", "л"],
  "3": ["е", "з"],
  "4": ["ч", "а"],
  "7": ["т", "л"],
  "8": ["в", "б"],
  r: ["г", "р"],
  "ǃ": ["и", "л"],
  "!": ["и"],
  "|": ["и", "л"],
  "¦": ["и", "л"],
};

const MAX_VARIANTS = 64;
const COMMENT_MAX = 500;

function collapseRepeats(value: string): string {
  return value.replace(/(.)\1{2,}/gu, "$1$1");
}

function normalizeVariants(value: string): string[] {
  const lower = value.toLowerCase().replace(/ё/g, "е");
  let variants = [""];

  for (const ch of lower) {
    let options: string[] | null = null;

    if (LOOKALIKE_AMBIGUOUS[ch]) {
      options = LOOKALIKE_AMBIGUOUS[ch];
    } else if (Object.prototype.hasOwnProperty.call(LOOKALIKE_SINGLE, ch)) {
      const mapped = LOOKALIKE_SINGLE[ch];
      options = mapped === "" ? [""] : [mapped];
    } else if (/[a-zа-я]/u.test(ch)) {
      options = [ch];
    } else {
      continue;
    }

    const next: string[] = [];
    for (const prefix of variants) {
      for (const opt of options) {
        next.push(prefix + opt);
        if (next.length >= MAX_VARIANTS) break;
      }
      if (next.length >= MAX_VARIANTS) break;
    }
    variants = next.length > 0 ? next : variants;
    if (variants.length >= MAX_VARIANTS) break;
  }

  return [...new Set(variants.map(collapseRepeats).filter(Boolean))];
}

export function containsLink(value: string): boolean {
  return LINK_RE.test(value);
}

export function containsProfanity(value: string): boolean {
  const variants = normalizeVariants(value);
  if (variants.length === 0) return false;

  return PROFANITY_STEMS.some((stem) => {
    const needle = stem.replace(/ё/g, "е");
    return variants.some((variant) => variant.includes(needle));
  });
}

export function isHoneypot(website: unknown): boolean {
  return String(website ?? "").trim() !== "";
}

export function validateCommentField(comment: string): string | null {
  const t = comment.trim();
  if (!t) return null;
  if (t.length > COMMENT_MAX) return "Комментарий слишком длинный";
  if (containsLink(t)) return "В комментарии нельзя указывать ссылки";
  if (containsProfanity(t)) return "Пожалуйста, без грубых слов — напишите иначе";
  return null;
}

export function validateGuestName(name: string): string | null {
  const n = name.trim();
  if (n.length < 2) return "Укажите имя";
  if (n.length > 40) return "Имя слишком длинное";
  if (containsLink(n)) return "В имени нельзя указывать ссылки";
  if (containsProfanity(n)) return "Пожалуйста, без грубых слов — напишите иначе";
  return null;
}

export function validateTakeawayName(name: string): string | null {
  const n = name.trim();
  const base = validateGuestName(n);
  if (base) return base;
  if (/\s/.test(n)) return "Имя — одно слово, без пробелов";
  return null;
}

export function sanitizePhoneInput(raw: string): string {
  let out = "";
  for (const ch of raw) {
    if (ch === "+") {
      if (out.length === 0) out = "+";
      continue;
    }
    if (ch >= "0" && ch <= "9" && out.length < 13) out += ch;
  }
  return out;
}

export function validatePhone(phone: string): string | null {
  const p = phone.trim();
  if (!p) return "Укажите телефон";
  if (p.length > 13) return "Телефон: максимум 13 символов";
  if (!/^\+?\d+$/.test(p)) return "Только цифры, «+» можно поставить в начале";
  return null;
}
