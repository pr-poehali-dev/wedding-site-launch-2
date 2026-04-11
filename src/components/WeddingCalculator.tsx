import { useState } from "react";
import Icon from "@/components/ui/icon";

type Item = {
  id: string;
  name: string;
  icon: string;
  min: number;
  max: number;
  category: string;
};

const ITEMS: Item[] = [
  // Образ невесты
  { id: "dress", name: "Платье + туфли", icon: "👗", min: 53000, max: 80000, category: "bride" },
  { id: "hair", name: "Прическа", icon: "💆", min: 2000, max: 5000, category: "bride" },
  { id: "bouquet", name: "Букет невесты", icon: "💐", min: 4000, max: 4000, category: "bride" },
  { id: "makeup", name: "Визажист", icon: "💄", min: 2500, max: 5000, category: "bride" },
  { id: "manicure", name: "Маникюр", icon: "✨", min: 3000, max: 3000, category: "bride" },
  { id: "rings", name: "Кольца", icon: "💍", min: 70000, max: 80000, category: "bride" },
  { id: "suit", name: "Костюм + туфли", icon: "🤵", min: 15000, max: 50000, category: "bride" },
  { id: "zags", name: "ЗАГС", icon: "📋", min: 350, max: 2000, category: "bride" },
  { id: "couple_look", name: "Образ пары / документы", icon: "📸", min: 149850, max: 229000, category: "bride" },

  // Оформление
  { id: "decor_banket", name: "Декор банкет", icon: "🌸", min: 60000, max: 90000, category: "decor" },
  { id: "decor_outdoor", name: "Декор выездная", icon: "🏛️", min: 40000, max: 70000, category: "decor" },
  { id: "menu", name: "Меню /1 чел.", icon: "🍽️", min: 3500, max: 5000, category: "decor" },
  { id: "hall_rent", name: "Аренда зала", icon: "🏠", min: 15000, max: 15000, category: "decor" },
  { id: "tent_rent", name: "Аренда шатра", icon: "⛺", min: 20000, max: 30000, category: "decor" },
  { id: "outdoor_rent", name: "Аренда выездной", icon: "🌿", min: 15000, max: 20000, category: "decor" },
  { id: "rislayker", name: "Рислейкер", icon: "🎪", min: 10000, max: 20000, category: "decor" },

  // Развлечения
  { id: "host", name: "Ведущий и DJ", icon: "🎤", min: 30000, max: 70000, category: "entertainment" },
  { id: "photo", name: "Фотограф", icon: "📷", min: 30000, max: 70000, category: "entertainment" },
  { id: "video", name: "Видеограф", icon: "🎬", min: 50000, max: 100000, category: "entertainment" },
  { id: "artists", name: "Артисты 3 номера", icon: "🎭", min: 30000, max: 30000, category: "entertainment" },
  { id: "light", name: "Аренда проф. света", icon: "💡", min: 30000, max: 60000, category: "entertainment" },
  { id: "heavy_smoke", name: "Тяжёлый дым", icon: "🌫️", min: 10000, max: 30000, category: "entertainment" },
  { id: "music", name: "Муз. группа", icon: "🎸", min: 50000, max: 70000, category: "entertainment" },
  { id: "cold_fountains", name: "Холодные фонтаны", icon: "✨", min: 10000, max: 30000, category: "entertainment" },
  { id: "salute", name: "Салют", icon: "🎆", min: 12000, max: 25000, category: "entertainment" },

  // Дополнительно
  { id: "cake", name: "Торт 9 кг", icon: "🎂", min: 20000, max: 20000, category: "extra" },
  { id: "buffet", name: "Фуршет", icon: "🥂", min: 20000, max: 20000, category: "extra" },
  { id: "polygraphy", name: "Полиграфия", icon: "🖨️", min: 5000, max: 10000, category: "extra" },
  { id: "transport", name: "Транспорт", icon: "🚌", min: 5000, max: 10000, category: "extra" },
  { id: "site_invite", name: "Сайт приглашение", icon: "💻", min: 5000, max: 10000, category: "extra" },
];

const CATEGORIES = [
  { id: "bride", label: "Образ пары", icon: "👰" },
  { id: "decor", label: "Оформление", icon: "🌸" },
  { id: "entertainment", label: "Развлечения", icon: "🎤" },
  { id: "extra", label: "Дополнительно", icon: "✨" },
];

const FORMAT = (n: number) =>
  n.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });

export default function WeddingCalculator() {
  const [selected, setSelected] = useState<Record<string, "min" | "max">>({});
  const [guests, setGuests] = useState(50);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (!next[id]) {
        next[id] = "min";
      } else if (next[id] === "min") {
        next[id] = "max";
      } else {
        delete next[id];
      }
      return next;
    });
  };

  const getItemTotal = (item: Item): number => {
    if (!selected[item.id]) return 0;
    const val = selected[item.id] === "min" ? item.min : item.max;
    if (item.id === "menu") return val * guests;
    return val;
  };

  const total = ITEMS.reduce((sum, item) => sum + getItemTotal(item), 0);
  const totalMin = ITEMS.filter((i) => selected[i.id]).reduce((sum, item) => sum + item.min * (item.id === "menu" ? guests : 1), 0);
  const totalMax = ITEMS.filter((i) => selected[i.id]).reduce((sum, item) => sum + item.max * (item.id === "menu" ? guests : 1), 0);

  const selectedCount = Object.keys(selected).length;

  const visibleItems = activeCategory
    ? ITEMS.filter((i) => i.category === activeCategory)
    : ITEMS;

  return (
    <section id="calculator" className="py-24 px-6" style={{ background: "rgba(0,0,0,0.3)" }}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="font-montserrat text-xs tracking-[0.4em] uppercase mb-4" style={{ color: "var(--gold)" }}>
            ✦ Оценка стоимости ✦
          </div>
          <h2 className="section-title mb-4" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>
            Калькулятор свадьбы
          </h2>
          <div className="gold-divider max-w-xs mx-auto mb-6" />
          <p className="font-montserrat text-sm" style={{ color: "rgba(245,237,216,0.45)" }}>
            Выберите услуги — нажмите один раз для минимальной цены, дважды для максимальной
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left: controls */}
          <div className="lg:col-span-2">

            {/* Guests slider */}
            <div className="mb-8 p-6" style={{ border: "1px solid rgba(201,169,110,0.2)", background: "rgba(201,169,110,0.03)" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="font-montserrat text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>
                  Количество гостей
                </span>
                <span className="font-cormorant text-3xl" style={{ color: "var(--gold)" }}>{guests}</span>
              </div>
              <input
                type="range"
                min={10}
                max={300}
                step={5}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full"
                style={{
                  accentColor: "var(--gold)",
                  height: "2px",
                  cursor: "pointer",
                }}
              />
              <div className="flex justify-between font-montserrat text-xs mt-2" style={{ color: "rgba(245,237,216,0.3)" }}>
                <span>10</span>
                <span>300</span>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setActiveCategory(null)}
                className="px-4 py-2 font-montserrat text-xs tracking-widest uppercase transition-all duration-200"
                style={{
                  background: !activeCategory ? "var(--gold)" : "transparent",
                  color: !activeCategory ? "var(--velvet)" : "rgba(245,237,216,0.5)",
                  border: !activeCategory ? "1px solid var(--gold)" : "1px solid rgba(201,169,110,0.2)",
                }}
              >
                Все
              </button>
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}
                  className="px-4 py-2 font-montserrat text-xs tracking-widest uppercase transition-all duration-200"
                  style={{
                    background: activeCategory === c.id ? "var(--gold)" : "transparent",
                    color: activeCategory === c.id ? "var(--velvet)" : "rgba(245,237,216,0.5)",
                    border: activeCategory === c.id ? "1px solid var(--gold)" : "1px solid rgba(201,169,110,0.2)",
                  }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visibleItems.map((item) => {
                const state = selected[item.id];
                const isMin = state === "min";
                const isMax = state === "max";
                return (
                  <button
                    key={item.id}
                    onClick={() => toggle(item.id)}
                    className="relative p-4 text-left transition-all duration-250 group"
                    style={{
                      background: isMax
                        ? "rgba(201,169,110,0.18)"
                        : isMin
                        ? "rgba(201,169,110,0.08)"
                        : "rgba(201,169,110,0.02)",
                      border: isMax
                        ? "1px solid var(--gold)"
                        : isMin
                        ? "1px solid rgba(201,169,110,0.5)"
                        : "1px solid rgba(201,169,110,0.12)",
                    }}
                  >
                    {/* State badge */}
                    {state && (
                      <div
                        className="absolute top-2 right-2 font-montserrat text-[9px] tracking-wide px-1.5 py-0.5"
                        style={{
                          background: isMax ? "var(--gold)" : "rgba(201,169,110,0.3)",
                          color: isMax ? "var(--velvet)" : "var(--gold)",
                        }}
                      >
                        {isMin ? "МИН" : "МАКС"}
                      </div>
                    )}

                    <div className="text-2xl mb-2">{item.icon}</div>
                    <div
                      className="font-montserrat text-xs leading-tight mb-2"
                      style={{ color: state ? "var(--cream)" : "rgba(245,237,216,0.6)", fontSize: "0.7rem" }}
                    >
                      {item.name}
                      {item.id === "menu" && <span style={{ color: "var(--gold)" }}> ×{guests}</span>}
                    </div>
                    <div
                      className="font-cormorant text-sm"
                      style={{ color: state ? "var(--gold)" : "rgba(201,169,110,0.45)" }}
                    >
                      {item.min === item.max
                        ? FORMAT(item.min)
                        : `${FORMAT(item.min).replace("₽", "")}– ${FORMAT(item.max)}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: summary */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 p-8"
              style={{ border: "1px solid rgba(201,169,110,0.3)", background: "rgba(13,11,8,0.9)" }}
            >
              <div className="font-montserrat text-xs tracking-[0.3em] uppercase mb-6 pb-4" style={{ color: "var(--gold)", borderBottom: "1px solid rgba(201,169,110,0.15)" }}>
                Ваша смета
              </div>

              {/* Selected items list */}
              <div className="mb-6 space-y-3 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,169,110,0.3) transparent" }}>
                {selectedCount === 0 ? (
                  <div className="font-montserrat text-xs text-center py-6" style={{ color: "rgba(245,237,216,0.25)" }}>
                    Выберите услуги из списка
                  </div>
                ) : (
                  ITEMS.filter((i) => selected[i.id]).map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="text-sm flex-shrink-0">{item.icon}</span>
                        <span className="font-montserrat truncate" style={{ fontSize: "0.68rem", color: "rgba(245,237,216,0.65)" }}>
                          {item.name}
                          {item.id === "menu" && ` ×${guests}`}
                        </span>
                      </div>
                      <span className="font-cormorant text-sm flex-shrink-0" style={{ color: "var(--gold)" }}>
                        {FORMAT(getItemTotal(item))}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {selectedCount > 0 && (
                <>
                  <div className="gold-divider mb-5" />

                  {/* Range */}
                  <div className="mb-2">
                    <div className="flex justify-between font-montserrat text-xs mb-1" style={{ color: "rgba(245,237,216,0.4)" }}>
                      <span>Диапазон</span>
                    </div>
                    <div className="flex justify-between font-cormorant text-base" style={{ color: "rgba(245,237,216,0.6)" }}>
                      <span>{FORMAT(totalMin)}</span>
                      <span>—</span>
                      <span>{FORMAT(totalMax)}</span>
                    </div>
                  </div>

                  <div className="gold-divider my-4" />

                  {/* Total */}
                  <div className="text-center mb-6">
                    <div className="font-montserrat text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(245,237,216,0.4)" }}>
                      Итого ({selected[Object.keys(selected)[0]] === "min" ? "мин" : "выбранное"})
                    </div>
                    <div className="font-cormorant" style={{ fontSize: "2rem", color: "var(--gold)", fontWeight: 300 }}>
                      {FORMAT(total)}
                    </div>
                    <div className="font-montserrat text-xs mt-1" style={{ color: "rgba(245,237,216,0.3)" }}>
                      {selectedCount} {selectedCount === 1 ? "услуга" : selectedCount < 5 ? "услуги" : "услуг"} выбрано
                    </div>
                  </div>

                  <button
                    className="gold-btn w-full py-4 relative"
                    onClick={() => document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <span>Получить точный расчёт</span>
                  </button>

                  <button
                    className="w-full mt-3 font-montserrat text-xs tracking-widest uppercase py-2 transition-all"
                    style={{ color: "rgba(245,237,216,0.3)" }}
                    onClick={() => setSelected({})}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(245,237,216,0.6)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(245,237,216,0.3)")}
                  >
                    Сбросить всё
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
