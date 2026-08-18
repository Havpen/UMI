import cleverCatalog from "./cleverCatalog.json";

export const site = {
  name: "UMI",
  city: "Гомель",
  address: "ул. Кирова, 35",
  addressFull: "ул. Кирова, 35, Гомель",
  landmark: "угол Кирова и Комсомольской, возле кольца, остановка БелГУТ",
  floor: "этаж 1",
  coords: { lat: 52.432738, lng: 31.004903 },
  phone: "+375 29 308-55-56",
  phoneHref: "tel:+375293085556",
  instagram: "https://instagram.com/umi_gomel",
  instagramHandle: "umi_gomel",
  h1: "Деликатная Азия",
  tagline: "Искусство баланса между Востоком и Европой.",
} as const;

export const hours = [
  { days: "Пн", open: "12:00", close: "22:00" },
  { days: "Вт–Чт", open: "12:00", close: "23:00" },
  { days: "Пт", open: "12:00", close: "00:00" },
  { days: "Сб", open: "11:00", close: "00:00" },
  { days: "Вс", open: "11:00", close: "22:00" },
] as const;

export function minskNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Minsk" }));
}

export function todayHallHours() {
  const day = minskNow().getDay();
  if (day === 1) return hours[0];
  if (day >= 2 && day <= 4) return hours[1];
  if (day === 5) return hours[2];
  if (day === 6) return hours[3];
  return hours[4];
}

export const lunch = {
  hours: "Будни 12:00–16:00",
  tile: "Будни 12:00–16:00. Салат, суп и горячее — сет или по отдельности.",
  text: "По будням с 12:00 до 16:00 — ланч: салат, суп и второе. Можно взять вместе или по одному. Тот же зал, дневной ритм.",
} as const;

export const brunch = {
  hours: "Сб–вс 11:00–15:00",
  text: "По субботам и воскресеньям с 11:00 до 15:00 в UMI бранч. Европейские завтраки в том же зале, куда вечером приходят на том ям и стейк. Если компания — стол лучше забронировать.",
} as const;

export const aggregators = [
  {
    name: "Яндекс Еда",
    href: "https://eda.yandex.by/gomel/r/restoran_umi_restaurant",
    logo: "/media/aggregators/yandex-eda.webp",
  },
  {
    name: "just-eat.by",
    href: "https://just-eat.by/umi-gomel",
    logo: "/media/aggregators/just-eat.webp",
  },
  {
    name: "clever.by",
    href: "https://clever.by/gomel/umirest-delivery/",
    logo: "/media/aggregators/clever-by.png?v=2",
  },
] as const;

export type MenuCategoryId =
  | "starters"
  | "salads-poke"
  | "soups"
  | "mains"
  | "sushi"
  | "desserts";

export const menuCategories: {
  id: MenuCategoryId;
  href: string;
  title: string;
  h1: string;
}[] = [
  { id: "starters", href: "/menu/starters", title: "Закуски", h1: "Закуски и стартеры" },
  { id: "salads-poke", href: "/menu/salads-poke", title: "Салаты и поке", h1: "Салаты и поке" },
  { id: "soups", href: "/menu/soups", title: "Супы", h1: "Супы" },
  { id: "mains", href: "/menu/mains", title: "Основные", h1: "Основные блюда" },
  { id: "sushi", href: "/menu/sushi", title: "Суши и роллы", h1: "Суши и роллы" },
  { id: "desserts", href: "/menu/desserts", title: "Десерты", h1: "Десерты" },
];

export type Hit = {
  id: string;
  name: string;
  price: string;
  category: MenuCategoryId;
  href: string;
  image?: string;
  description?: string;
  weight?: string;
};

type CleverDish = {
  id: string;
  name: string;
  price: string;
  category: MenuCategoryId;
  description: string;
  weight: string;
  image: string;
};

const cleverDishes = cleverCatalog as CleverDish[];
const cleverById = new Map(cleverDishes.map((dish) => [dish.id, dish]));

const hitDefs: { id: string; name: string; price: string; category: MenuCategoryId }[] = [
  { id: "vitello-tonnato", name: "Вителло тоннато", price: "25,50", category: "starters" },
  { id: "tom-yam", name: "Том ям с морепродуктами", price: "29,00", category: "soups" },
  { id: "philadelphia", name: "Филадельфия с авокадо", price: "31,50", category: "sushi" },
  { id: "tagliatelle", name: "Тальятелле с тунцом татаки", price: "24,00", category: "mains" },
  { id: "ramen", name: "Рамен с говядиной", price: "28,50", category: "soups" },
  { id: "striploin", name: "Стейк стриплойн с бельгийским картофелем", price: "60,00", category: "mains" },
  { id: "baked-roll", name: "Запечённый ролл с креветкой и манго", price: "23,50", category: "sushi" },
  { id: "citrus-salad", name: "Салат с креветками в цитрусовой заправке", price: "26,00", category: "salads-poke" },
  { id: "fettuccine", name: "Фетучини с рваной уткой", price: "32,50", category: "mains" },
  { id: "tempura", name: "Темпура с карамелизированным лососем", price: "25,00", category: "sushi" },
  { id: "poke", name: "Поке с лососем", price: "26,50", category: "salads-poke" },
  { id: "gyoza", name: "Гёдза со свининой", price: "25,50", category: "starters" },
];

const draftDescriptions: Record<string, string> = {
  "vitello-tonnato": "Телятина, соус из тунца, каперсы, руккола, сыр «Пармезан»",
  "tom-yam": "Кокосовый бульон, креветки, кальмар, грибы, лемонграсс, лайм, кинза",
  "tagliatelle": "Тальятелле, тунец татаки, соус, зелень",
  "tempura": "Лосось карамелизированный, кляр темпура, соус",
  "poke": "Рис, лосось, авокадо, огурец, эдамаме, соус поке, кунжут",
  "gyoza": "Тесто, свинина, капуста, зелёный лук, соус",
  "salat-s-rostbifom-i-lukom-fri": "Салат, ростбиф, лук фри, соус",
  "poke-s-bekonom": "Рис, бекон, авокадо, овощи, соус поке, кунжут",
  "gribnoy-krem-sup-s-kopchyonoy": "Грибы, сливки, копчёное мясо",
  "roll-s-krevetkoy-lososem-i-avokado-v-tobiko":
    "Рис, водоросли «Нори», сыр сливочный, креветка, лосось, авокадо, тобико",
  "roll-v-opalennom-tuntse-s-ogurtsom-i-lososem":
    "Рис, водоросли «Нори», сыр сливочный, опаленный тунец, огурец, лосось",
  "roll-s-tuntsom-lososem-i-krevetkoy": "Рис, водоросли «Нори», сыр сливочный, тунец, лосось, креветка",
  "roll-v-opalennom-morskom-okune-s-mango":
    "Рис, водоросли «Нори», сыр сливочный, опаленный морской окунь, манго",
  "roll-v-losose-s-kokosovym-sousom": "Рис, водоросли «Нори», сыр сливочный, лосось, кокосовый соус",
  "roll-s-lososem-tataki-i-takuanom": "Рис, водоросли «Нори», сыр сливочный, лосось татаки, такуан",
  "zapechyonnyy-roll-s-bekonom":
    "Рис, водоросли «Нори», бекон, сливочный сыр, сырная шапка, соус «Унаги», кунжут",
  "zapechyonnyy-roll-s-opalennym-okunem":
    "Рис, водоросли «Нори», опаленный окунь, сливочный сыр, сырная шапка, кунжут",
  "zapechyonnyy-roll-s-tuntsom-i-krevetkoy":
    "Рис, водоросли «Нори», тунец, креветка, сливочный сыр, сырная шапка, кунжут",
  "utinaya-nozhka-konfi-s-kartofelnym-pyure": "Утиная ножка конфи, картофельное пюре",
  "khrustyashchiy-kalmar-v-souse-5-spetsiy": "Кальмар, соус 5 специй",
  "steyk-file-minon-s-kartofelnym-pyure": "Стейк «Филе-миньон», картофельное пюре",
  striploin: "Стейк стриплойн, бельгийский картофель",
  "steyk-iz-lososya-s-brokkoli": "Стейк из лосося, брокколи",
  "pasta-karbonara": "Паста, бекон, яйцо, сыр «Пармезан»",
  "spagetti-amatrichana-s-bekonom": "Спагетти, бекон, томатный соус, перец «Чили»",
  "pasta-talyatelle-s-krevetkami": "Тальятелле, креветки, соус",
  fettuccine: "Фетучини, рваная утка, соус",
};

function dishDescription(id: string, clever?: string) {
  return clever || draftDescriptions[id];
}

function fromClever(id: string): Pick<Hit, "image" | "description" | "weight"> {
  const row = cleverById.get(id);
  return {
    image: row?.image,
    description: dishDescription(id, row?.description),
    weight: row?.weight || undefined,
  };
}

export const hits: Hit[] = hitDefs.map((hit) => ({
  ...hit,
  href: `/menu/${hit.category}#${hit.id}`,
  ...fromClever(hit.id),
}));

const hitIds = new Set(hits.map((hit) => hit.id));

export const dishes: Hit[] = [
  ...hits,
  ...cleverDishes
    .filter((dish) => !hitIds.has(dish.id))
    .map((dish) => ({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      category: dish.category,
      href: `/menu/${dish.category}#${dish.id}`,
      image: dish.image,
      description: dishDescription(dish.id, dish.description),
      weight: dish.weight || undefined,
    })),
];

export function dishesInCategory(id: MenuCategoryId) {
  const featured = hits.filter((hit) => hit.category === id);
  const rest = dishes.filter((dish) => dish.category === id && !hitIds.has(dish.id));
  return [...featured, ...rest];
}

export function dishById(id: string) {
  return dishes.find((dish) => dish.id === id);
}

export function dishPhoto(dish?: Pick<Hit, "image"> | null) {
  return dish?.image ?? "/media/dish-placeholder.jpg";
}

export function dishAlt(name: string) {
  return `${name} — ресторан UMI Гомель`;
}

export function categoryCover(id: MenuCategoryId) {
  return dishesInCategory(id).find((dish) => dish.image);
}

export const interiors = [
  {
    src: "/media/interior/umi-16.jpg",
    alt: "Стойка UMI и стеклянная панель с логотипом",
    title: "Наш бар",
    caption: "Стойка встречает у входа. За стеклом — свет и знак UMI.",
    layout: "hero",
  },
  {
    src: "/media/interior/umi-02.jpg",
    alt: "Основной зал UMI — посадка и свет из окон",
    title: "Основной зал",
    caption: "Один светлый зал на всю посадку. Столы, окна и спокойный ритм вечера.",
    layout: "wide",
  },
  {
    src: "/media/interior/umi-03.jpg",
    alt: "Угол зала у окна — зелёные кресла и живая стена",
    title: "Угол у окна",
    caption: "Тихий закуток с креслами и растениями — для двоих или небольшой компании.",
    layout: "tall",
  },
  {
    src: "/media/interior/umi-14.jpg",
    alt: "Посадка у окон в зале UMI",
    title: "У окон",
    caption: "Подиум к улице: деревья за стеклом и чуть отделённая посадка.",
    layout: "wide",
  },
  {
    src: "/media/interior/umi-08.jpg",
    alt: "Закуток UMI — диван и растения",
    title: "Закуток",
    caption: "Мягкий угол чуть в стороне: диван, зелень и меньше сквозного движения.",
    layout: "tall",
  },
  {
    src: "/media/interior/umi-10.jpg",
    alt: "Зал и частично открытая кухня UMI",
    title: "Открытая кухня",
    caption: "Кухня не спрятана за дверью — видно, как собирают тарелку.",
    layout: "tall",
  },
  {
    src: "/media/interior/umi-15.jpg",
    alt: "Деревянный потолок и светильники в зале UMI",
    title: "Свет",
    caption: "Деревянные рейки и чёрные светильники — тихий каркас потолка.",
    layout: "tall",
  },
  {
    src: "/media/interior/umi-04.jpg",
    alt: "Посадка в зале UMI — рыбы на стене и жёлтый диван",
    title: "Рыбы на стене",
    caption: "Жёлтый диван и декоративные рыбы — самый узнаваемый угол зала.",
    layout: "normal",
  },
  {
    src: "/media/interior/umi-07.jpg",
    alt: "Столы у декоративных рыб в зале UMI",
    title: "Посадка в зале",
    caption: "Столы напротив стены с рыбами. Тот же зал, ближе к декору.",
    layout: "normal",
  },
  {
    src: "/media/interior/umi-11.jpg",
    alt: "Подиум у окон — столы и растения",
    title: "Подиум",
    caption: "На ступеньку выше: стекло, растения и свет из высоких окон.",
    layout: "end",
  },
] as const;

export const seo = {
  "/": {
    title: "UMI — ресторан в Гомеле | Деликатная Азия",
    description:
      "Камерный зал в центре Гомеля: азиатское ядро и европейские блюда. Забронировать стол, бизнес-ланч, бранч, заказ с собой.",
  },
  "/menu": {
    title: "Меню ресторана UMI в Гомеле",
    description:
      "Стартеры, салаты и поке, супы, вок и паста, суши и роллы, десерты. Азия и Европа в одном меню.",
  },
  "/menu/starters": {
    title: "Закуски и стартеры — UMI Гомель",
    description:
      "Вителло тоннато, гёдза со свининой и другие стартеры ресторана UMI. Закуски к столу в зале и с собой.",
  },
  "/menu/salads-poke": {
    title: "Салаты и поке — UMI Гомель",
    description:
      "Салат с креветками в цитрусовой заправке, поке с лососем и другие лёгкие блюда в ресторане UMI в Гомеле.",
  },
  "/menu/soups": {
    title: "Супы: том ям и рамен — UMI Гомель",
    description: "Том ям с морепродуктами, рамен с говядиной и другие супы в ресторане UMI.",
  },
  "/menu/mains": {
    title: "Основные блюда: вок, паста, горячее — UMI",
    description:
      "Тальятелле с тунцом татаки, фетучини с рваной уткой, стейк стриплойн, вок. Основные блюда ресторана UMI в Гомеле.",
  },
  "/menu/sushi": {
    title: "Суши и роллы — UMI Гомель",
    description:
      "Филадельфия с авокадо, запечённый ролл с креветкой и манго, темпура с лососем. Нигири и роллы в UMI.",
  },
  "/menu/desserts": {
    title: "Десерты — ресторан UMI Гомель",
    description: "Десерты к столу в зале UMI. Забронировать стол в центре Гомеля.",
  },
  "/lunch": {
    title: "Бизнес-ланч в Гомеле — UMI",
    description:
      "Ланч по будням с 12:00 до 16:00: салат, суп и второе — вместе или по одному. Ресторан UMI, центр Гомеля.",
  },
  "/brunch": {
    title: "Бранч в Гомеле на выходных — UMI",
    description:
      "Бранч в субботу и воскресенье с 11:00 до 15:00 в ресторане UMI. Забронировать стол в центре Гомеля.",
  },
  "/delivery": {
    title: "Заказ с собой — UMI Гомель",
    description: "Самовывоз из ресторана UMI. Заявка на сайте, доставка — в агрегаторах.",
  },
  "/booking": {
    title: "Забронировать стол — UMI Гомель",
    description:
      "Бронь стола в ресторане UMI: имя, телефон, дата и время. Подтвердим звонком. Кирова, 35.",
  },
  "/contacts": {
    title: "Контакты UMI — Гомель, Кирова 35",
    description:
      "Ресторан UMI: ул. Кирова, 35, Гомель. Телефон +375 29 308-55-56. Часы работы, Instagram umi_gomel.",
  },
} as const;

export const homeSeoText =
  "UMI — камерный ресторан в центре Гомеля. В меню азиатское ядро и европейские блюда: том ям и рамен рядом с пастой и стейком, роллы — рядом с вителло тоннато. Вечером — стол в зале, днём — ланч, в выходные — бранч. Стол бронируют на сайте, заказ с собой — заявкой, доставку везут агрегаторы.";

export const nav = [
  { href: "/menu", label: "Меню" },
  { href: "/lunch", label: "Ланч" },
  { href: "/brunch", label: "Бранч" },
  { href: "/delivery", label: "С собой" },
  { href: "/contacts", label: "Контакты" },
] as const;
