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
  | "sushi";

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
];

export type Hit = {
  id: string;
  name: string;
  price: string;
  category: MenuCategoryId;
  href: string;
};

export const hits: Hit[] = [
  { id: "vitello-tonnato", name: "Вителло тоннато", price: "25,50", category: "starters", href: "/menu/starters#vitello-tonnato" },
  { id: "tom-yam", name: "Том ям с морепродуктами", price: "29,00", category: "soups", href: "/menu/soups#tom-yam" },
  { id: "philadelphia", name: "Филадельфия с авокадо", price: "31,50", category: "sushi", href: "/menu/sushi#philadelphia" },
  { id: "tagliatelle", name: "Тальятелле с тунцом татаки", price: "24,00", category: "mains", href: "/menu/mains#tagliatelle" },
  { id: "ramen", name: "Рамен с говядиной", price: "28,50", category: "soups", href: "/menu/soups#ramen" },
  { id: "striploin", name: "Стейк стриплойн с бельгийским картофелем", price: "60,00", category: "mains", href: "/menu/mains#striploin" },
  { id: "baked-roll", name: "Запечённый ролл с креветкой и манго", price: "23,50", category: "sushi", href: "/menu/sushi#baked-roll" },
  { id: "citrus-salad", name: "Салат с креветками в цитрусовой заправке", price: "26,00", category: "salads-poke", href: "/menu/salads-poke#citrus-salad" },
  { id: "fettuccine", name: "Фетучини с рваной уткой", price: "32,50", category: "mains", href: "/menu/mains#fettuccine" },
  { id: "tempura", name: "Темпура с карамелизированным лососем", price: "25,00", category: "sushi", href: "/menu/sushi#tempura" },
  { id: "poke", name: "Поке с лососем", price: "26,50", category: "salads-poke", href: "/menu/salads-poke#poke" },
  { id: "gyoza", name: "Гёдза со свининой", price: "25,50", category: "starters", href: "/menu/starters#gyoza" },
];

export const interiors = [
  {
    src: "/media/interior/img_3543.jpg",
    alt: "Зал ресторана UMI в Гомеле — посадка у окон",
  },
  {
    src: "/media/interior/img_3544.jpg",
    alt: "Угол зала UMI — диван и декоративные рыбы на стене",
  },
  {
    src: "/media/interior/img_3545.jpg",
    alt: "Посадка в зале UMI — кресла, столы, светильник",
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
      "Стартеры, салаты и поке, супы, вок и паста, суши и роллы. Азия и Европа в одном меню.",
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
