import { mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "media", "dishes");
const htmlPath = join(process.env.TEMP || "/tmp", "clever-umi.html");
const catalogPath = join(root, "lib", "cleverCatalog.json");
const sourceUrl = "https://clever.by/gomel/umirest-delivery/";

const CAT = {
  Салаты: "salads-poke",
  Поке: "salads-poke",
  Супы: "soups",
  Вок: "mains",
  Роллы: "sushi",
  "Запечённые роллы": "sushi",
  "Горячие блюда": "mains",
  Десерты: "desserts",
  Паста: "mains",
};

const HIT_MATCH = [
  { id: "citrus-salad", re: /цитрусов/i },
  { id: "ramen", re: /рамен с говядиной/i },
  { id: "philadelphia", re: /филадельфия/i, skip: /запеч/i },
  { id: "baked-roll", re: /запеч[её]нн\S* ролл с креветкой и манго/i },
  { id: "striploin", re: /стриплойн/i },
  { id: "fettuccine", re: /фетучини/i },
];

const RU = {
  а: "a",
  б: "b",
  в: "v",
  г: "g",
  д: "d",
  е: "e",
  ё: "yo",
  ж: "zh",
  з: "z",
  и: "i",
  й: "y",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ъ: "",
  ы: "y",
  ь: "",
  э: "e",
  ю: "yu",
  я: "ya",
};

function clean(s) {
  return (s || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatPrice(raw) {
  const n = raw.replace(/\s/g, "").replace(",", ".");
  const v = Number.parseFloat(n);
  if (!Number.isFinite(v)) return "";
  return v.toFixed(2).replace(".", ",");
}

function slug(name) {
  const latin = name
    .toLowerCase()
    .replace(/[а-яё]/g, (ch) => RU[ch] ?? ch)
    .replace(/[«»"']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 56);
  return latin || "dish";
}

function hitIdFor(name) {
  for (const rule of HIT_MATCH) {
    if (rule.skip && rule.skip.test(name)) continue;
    if (rule.re.test(name)) return rule.id;
  }
  return null;
}

function isRealImage(url) {
  return Boolean(url) && !url.includes("/assets/dostavka/bg.png") && /^https?:\/\//.test(url);
}

function parse(html) {
  const dishes = [];
  let category = "";
  const re =
    /<h2 class="sect__title">([^<]+)<\/h2>|<i id="dish\d+" class="ddish__anchor">([\s\S]*?)(?=<i id="dish\d+" class="ddish__anchor">|<h2 class="sect__title"|<script type="text\/template" class="term__data")/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[1]) {
      category = CAT[clean(m[1])] || "";
      continue;
    }
    const block = m[2] || "";
    if (!block.includes("ddish__url")) continue;
    const name = clean((block.match(/class="ddish__url">([\s\S]*?)<\/a>/) || [])[1]);
    const full = (block.match(/data-full="([^"]+)"/) || [])[1] || "";
    const src = (block.match(/data-src="([^"]+)"/) || [])[1] || "";
    const image = isRealImage(full) ? full : isRealImage(src) ? src : "";
    const desc = clean((block.match(/class="ddish__ingredients"[^>]*>([\s\S]*?)<\/div>/) || [])[1]);
    const weight = clean((block.match(/class="ddish__size(?:--mobile)?"[^>]*>([\s\S]*?)<\/span>/) || [])[1]);
    const priceRaw = clean((block.match(/class="ddish__sum--final">([\s\S]*?)<\/div>/) || [])[1]).replace(/руб\.?/i, "");
    if (!name || !category || !image) continue;
    const id = hitIdFor(name) || slug(name);
    dishes.push({
      id,
      name: name.replace(/^Запеченный /, "Запечённый ").replace(/^Безглятеновый /, "Безглютеновый "),
      price: formatPrice(priceRaw),
      category,
      imageUrl: image,
      description: desc,
      weight: weight.replace(/\s+/g, " "),
      hit: Boolean(hitIdFor(name)),
    });
  }
  return dishes;
}

async function fetchHtml() {
  try {
    return readFileSync(htmlPath, "utf8");
  } catch {
    const res = await fetch(sourceUrl, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });
    const html = await res.text();
    writeFileSync(htmlPath, html);
    return html;
  }
}

async function download(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      referer: sourceUrl,
    },
  });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

const html = await fetchHtml();
const dishes = parse(html);
mkdirSync(outDir, { recursive: true });

const used = new Set();
for (const dish of dishes) {
  if (used.has(dish.id)) dish.id = `${dish.id}-2`;
  used.add(dish.id);
}

for (const dish of dishes) {
  const file = `${dish.id}.jpg`;
  const dest = join(outDir, file);
  process.stdout.write(`photo ${dish.id}\n`);
  const buf = await download(dish.imageUrl);
  await sharp(buf)
    .rotate()
    .resize(1400, 1400, { fit: "inside", withoutEnlargement: true })
    .flatten({ background: "#f4efe6" })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(dest);
  dish.image = `/media/dishes/${file}`;
  delete dish.imageUrl;
}

writeFileSync(catalogPath, `${JSON.stringify(dishes.map(({ hit, ...dish }) => dish), null, 2)}\n`);
console.log("parsed", dishes.length);
for (const d of dishes) {
  console.log(`${d.hit ? "HIT" : "   "} ${d.id} | ${d.category} | ${d.name} | ${d.price} | ${d.weight}`);
}
