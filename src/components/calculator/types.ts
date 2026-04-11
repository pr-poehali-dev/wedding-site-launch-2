export type Item = {
  id: string;
  name: string;
  icon: string;
  defaultMin: number;
  defaultMax: number;
  category: string;
};

export type Prices = Record<string, { min: string; max: string }>;

export type EstimateRow = {
  icon: string;
  name: string;
  econom: number;
  premium: number;
};

export const SEND_ESTIMATE_URL = "https://functions.poehali.dev/e9f41fef-c047-4cd3-ab99-becbe1197f36";

export const ITEMS: Item[] = [
  { id: "dress", name: "Платье + туфли", icon: "👗", defaultMin: 53000, defaultMax: 80000, category: "bride" },
  { id: "hair", name: "Прическа", icon: "💆", defaultMin: 2000, defaultMax: 5000, category: "bride" },
  { id: "bouquet", name: "Букет невесты", icon: "💐", defaultMin: 4000, defaultMax: 4000, category: "bride" },
  { id: "makeup", name: "Визажист", icon: "💄", defaultMin: 2500, defaultMax: 5000, category: "bride" },
  { id: "manicure", name: "Маникюр", icon: "✨", defaultMin: 3000, defaultMax: 3000, category: "bride" },
  { id: "rings", name: "Кольца", icon: "💍", defaultMin: 70000, defaultMax: 80000, category: "bride" },
  { id: "suit", name: "Костюм + туфли", icon: "🤵", defaultMin: 15000, defaultMax: 50000, category: "bride" },
  { id: "zags", name: "ЗАГС", icon: "📋", defaultMin: 350, defaultMax: 2000, category: "bride" },

  { id: "decor_banket", name: "Декор банкет", icon: "🌸", defaultMin: 60000, defaultMax: 90000, category: "decor" },
  { id: "decor_outdoor", name: "Декор выездная", icon: "🏛️", defaultMin: 40000, defaultMax: 70000, category: "decor" },
  { id: "menu", name: "Меню /1 чел.", icon: "🍽️", defaultMin: 3500, defaultMax: 5000, category: "decor" },
  { id: "hall_rent", name: "Аренда зала", icon: "🏠", defaultMin: 15000, defaultMax: 15000, category: "decor" },
  { id: "tent_rent", name: "Аренда шатра", icon: "⛺", defaultMin: 20000, defaultMax: 30000, category: "decor" },
  { id: "outdoor_rent", name: "Аренда выездной", icon: "🌿", defaultMin: 15000, defaultMax: 20000, category: "decor" },
  { id: "rislayker", name: "Рислейкер", icon: "🎪", defaultMin: 10000, defaultMax: 20000, category: "decor" },

  { id: "host", name: "Ведущий и DJ", icon: "🎤", defaultMin: 30000, defaultMax: 70000, category: "entertainment" },
  { id: "photo", name: "Фотограф", icon: "📷", defaultMin: 30000, defaultMax: 70000, category: "entertainment" },
  { id: "video", name: "Видеограф", icon: "🎬", defaultMin: 50000, defaultMax: 100000, category: "entertainment" },
  { id: "artists", name: "Артисты 3 номера", icon: "🎭", defaultMin: 30000, defaultMax: 30000, category: "entertainment" },
  { id: "light", name: "Аренда проф. света", icon: "💡", defaultMin: 30000, defaultMax: 60000, category: "entertainment" },
  { id: "heavy_smoke", name: "Тяжёлый дым", icon: "🌫️", defaultMin: 10000, defaultMax: 30000, category: "entertainment" },
  { id: "music", name: "Муз. группа", icon: "🎸", defaultMin: 50000, defaultMax: 70000, category: "entertainment" },
  { id: "cold_fountains", name: "Холодные фонтаны", icon: "✨", defaultMin: 10000, defaultMax: 30000, category: "entertainment" },
  { id: "salute", name: "Салют", icon: "🎆", defaultMin: 12000, defaultMax: 25000, category: "entertainment" },

  { id: "cake", name: "Торт 9 кг", icon: "🎂", defaultMin: 20000, defaultMax: 20000, category: "extra" },
  { id: "buffet", name: "Фуршет", icon: "🥂", defaultMin: 20000, defaultMax: 20000, category: "extra" },
  { id: "polygraphy", name: "Полиграфия", icon: "🖨️", defaultMin: 5000, defaultMax: 10000, category: "extra" },
  { id: "transport", name: "Транспорт", icon: "🚌", defaultMin: 5000, defaultMax: 10000, category: "extra" },
  { id: "site_invite", name: "Сайт приглашение", icon: "💻", defaultMin: 5000, defaultMax: 10000, category: "extra" },
];

export const CATEGORIES = [
  { id: "bride", label: "Образ пары", icon: "👰" },
  { id: "decor", label: "Оформление", icon: "🌸" },
  { id: "entertainment", label: "Развлечения", icon: "🎤" },
  { id: "extra", label: "Дополнительно", icon: "✨" },
];

export const FORMAT = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";
