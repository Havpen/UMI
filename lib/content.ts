import hallCategories from "./hallCategories.json";
import type { HallCategory, MenuCategoryId } from "./hallMenuShared";

export type { HallCategory, HallDish, MenuCategoryId } from "./hallMenuShared";

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
  tile: "Будни 12:00–16:00. Салат, суп и горячее — комплекс или по отдельности.",
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

export const menuCategories: {
  id: MenuCategoryId;
  href: string;
  title: string;
  h1: string;
}[] = (hallCategories as HallCategory[]).map((cat) => ({
  ...cat,
  href: `/menu/${cat.id}`,
}));

export type Hit = {
  id: string;
  name: string;
  price: string;
  category: MenuCategoryId;
  href: string;
  image?: string;
  description?: string;
  weight?: string;
  nameEn?: string;
  descriptionEn?: string;
};

export function dishPhoto(dish?: Pick<Hit, "image"> | null) {
  return dish?.image ?? "/media/dish-placeholder.jpg";
}

export function dishAlt(name: string) {
  return `${name} — ресторан UMI Гомель`;
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
  "/menu/nigiri": {
    title: "Нигири — UMI Гомель",
    description: "Нигири с лососем и нигири с тунцом в ресторане UMI в Гомеле.",
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

export function categorySeo(id: string) {
  const key = `/menu/${id}` as keyof typeof seo;
  const known = seo[key];
  if (known) return known;
  const cat = menuCategories.find((item) => item.id === id);
  if (!cat) return null;
  return {
    title: `${cat.h1} — UMI Гомель`,
    description: `${cat.title} в ресторане UMI в Гомеле.`,
  };
}

export const homeSeoText =
  "UMI — камерный ресторан в центре Гомеля. В меню азиатское ядро и европейские блюда: том ям и рамен рядом с пастой и стейком, роллы — рядом с вителло тоннато. Вечером — стол в зале, днём — ланч, в выходные — бранч. Стол бронируют на сайте, заказ с собой — заявкой, доставку везут агрегаторы.";

export const nav = [
  { href: "/menu", label: "Меню" },
  { href: "/lunch", label: "Ланч" },
  { href: "/brunch", label: "Бранч" },
  { href: "/delivery", label: "С собой" },
  { href: "/contacts", label: "Контакты" },
] as const;
