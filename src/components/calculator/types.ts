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
  { id: "dress", name: "Платье + туфли", icon: "Shirt", defaultMin: 53000, defaultMax: 80000, category: "bride" },
  { id: "hair", name: "Прическа", icon: "Scissors", defaultMin: 2000, defaultMax: 5000, category: "bride" },
  { id: "bouquet", name: "Букет невесты", icon: "Flower2", defaultMin: 4000, defaultMax: 4000, category: "bride" },
  { id: "makeup", name: "Визажист", icon: "Sparkles", defaultMin: 2500, defaultMax: 5000, category: "bride" },
  { id: "manicure", name: "Маникюр", icon: "Hand", defaultMin: 3000, defaultMax: 3000, category: "bride" },
  { id: "rings", name: "Кольца", icon: "Circle", defaultMin: 70000, defaultMax: 80000, category: "bride" },
  { id: "suit", name: "Костюм + туфли", icon: "Briefcase", defaultMin: 15000, defaultMax: 50000, category: "bride" },
  { id: "zags", name: "ЗАГС", icon: "ScrollText", defaultMin: 350, defaultMax: 2000, category: "bride" },

  { id: "decor_banket", name: "Декор банкет", icon: "Cherry", defaultMin: 60000, defaultMax: 90000, category: "decor" },
  { id: "decor_outdoor", name: "Декор выездная", icon: "Landmark", defaultMin: 40000, defaultMax: 70000, category: "decor" },
  { id: "hall_rent", name: "Аренда зала", icon: "Building2", defaultMin: 15000, defaultMax: 15000, category: "restaurant" },
  { id: "tent_rent", name: "Аренда шатра", icon: "Tent", defaultMin: 20000, defaultMax: 30000, category: "restaurant" },
  { id: "outdoor_rent", name: "Аренда выездной", icon: "TreePine", defaultMin: 15000, defaultMax: 20000, category: "restaurant" },
  { id: "menu", name: "Меню /1 чел.", icon: "UtensilsCrossed", defaultMin: 3500, defaultMax: 5000, category: "restaurant" },
  { id: "buffet", name: "Фуршет", icon: "GlassWater", defaultMin: 20000, defaultMax: 20000, category: "restaurant" },

  { id: "host", name: "Ведущий и диджей", icon: "Mic2", defaultMin: 30000, defaultMax: 70000, category: "entertainment" },
  { id: "photo", name: "Фотограф", icon: "Camera", defaultMin: 30000, defaultMax: 70000, category: "entertainment" },
  { id: "video", name: "Видеограф", icon: "Video", defaultMin: 50000, defaultMax: 100000, category: "entertainment" },
  { id: "artists", name: "Артисты", icon: "Drama", defaultMin: 30000, defaultMax: 30000, category: "entertainment" },
  { id: "light", name: "Аренда проф. света", icon: "Lamp", defaultMin: 30000, defaultMax: 60000, category: "entertainment" },
  { id: "heavy_smoke", name: "Тяжёлый дым", icon: "Wind", defaultMin: 10000, defaultMax: 30000, category: "entertainment" },
  { id: "music", name: "Муз. группа", icon: "Music2", defaultMin: 50000, defaultMax: 70000, category: "entertainment" },
  { id: "cold_fountains", name: "Холодные фонтаны", icon: "Droplets", defaultMin: 10000, defaultMax: 30000, category: "entertainment" },
  { id: "salute", name: "Салют", icon: "Zap", defaultMin: 12000, defaultMax: 25000, category: "entertainment" },

  { id: "cake", name: "Торт 9 кг", icon: "Cake", defaultMin: 20000, defaultMax: 20000, category: "extra" },
  { id: "rislayker", name: "Вертикальное видео", icon: "Smartphone", defaultMin: 10000, defaultMax: 20000, category: "extra" },
  { id: "polygraphy", name: "Полиграфия", icon: "Printer", defaultMin: 5000, defaultMax: 10000, category: "extra" },
  { id: "transport", name: "Транспорт", icon: "Bus", defaultMin: 5000, defaultMax: 10000, category: "extra" },
  { id: "site_invite", name: "Сайт приглашение", icon: "MonitorSmartphone", defaultMin: 5000, defaultMax: 10000, category: "extra" },
];

export const CATEGORIES = [
  { id: "bride", label: "Образ пары", icon: "Heart" },
  { id: "decor", label: "Декор", icon: "Flower2" },
  { id: "restaurant", label: "Ресторан", icon: "UtensilsCrossed" },
  { id: "entertainment", label: "Развлечения", icon: "Mic2" },
  { id: "extra", label: "Дополнительно", icon: "Plus" },
];

export const FORMAT = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";