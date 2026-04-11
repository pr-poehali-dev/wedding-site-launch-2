import { useState } from "react";

type Item = {
  id: string;
  name: string;
  icon: string;
  defaultMin: number;
  defaultMax: number;
  category: string;
};

const ITEMS: Item[] = [
  { id: "dress", name: "Платье + туфли", icon: "👗", defaultMin: 53000, defaultMax: 80000, category: "bride" },
  { id: "hair", name: "Прическа", icon: "💆", defaultMin: 2000, defaultMax: 5000, category: "bride" },
  { id: "bouquet", name: "Букет невесты", icon: "💐", defaultMin: 4000, defaultMax: 4000, category: "bride" },
  { id: "makeup", name: "Визажист", icon: "💄", defaultMin: 2500, defaultMax: 5000, category: "bride" },
  { id: "manicure", name: "Маникюр", icon: "✨", defaultMin: 3000, defaultMax: 3000, category: "bride" },
  { id: "rings", name: "Кольца", icon: "💍", defaultMin: 70000, defaultMax: 80000, category: "bride" },
  { id: "suit", name: "Костюм + туфли", icon: "🤵", defaultMin: 15000, defaultMax: 50000, category: "bride" },
  { id: "zags", name: "ЗАГС", icon: "📋", defaultMin: 350, defaultMax: 2000, category: "bride" },
  { id: "couple_look", name: "Образ пары / документы", icon: "📸", defaultMin: 149850, defaultMax: 229000, category: "bride" },

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

const CATEGORIES = [
  { id: "bride", label: "Образ пары", icon: "👰" },
  { id: "decor", label: "Оформление", icon: "🌸" },
  { id: "entertainment", label: "Развлечения", icon: "🎤" },
  { id: "extra", label: "Дополнительно", icon: "✨" },
];

const FORMAT = (n: number) =>
  n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";

const parseNum = (s: string) => {
  const n = parseInt(s.replace(/\D/g, ""), 10);
  return isNaN(n) ? 0 : n;
};

type Prices = Record<string, { min: string; max: string }>;

export default function WeddingCalculator() {
  const [prices, setPrices] = useState<Prices>({});
  const [guests, setGuests] = useState(50);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const getVal = (item: Item, key: "min" | "max"): string =>
    prices[item.id]?.[key] ?? "";

  const setVal = (id: string, key: "min" | "max", val: string) => {
    setPrices((prev) => ({
      ...prev,
      [id]: { min: prev[id]?.min ?? "", max: prev[id]?.max ?? "", [key]: val },
    }));
  };

  const getNumericVal = (item: Item, key: "min" | "max"): number => {
    const raw = getVal(item, key);
    if (raw !== "") return parseNum(raw);
    return 0;
  };

  const isActive = (item: Item) => {
    const minVal = getVal(item, "min");
    const maxVal = getVal(item, "max");
    return minVal !== "" || maxVal !== "";
  };

  const getItemMin = (item: Item) => {
    const v = getNumericVal(item, "min");
    return item.id === "menu" ? v * guests : v;
  };

  const getItemMax = (item: Item) => {
    const v = getNumericVal(item, "max");
    return item.id === "menu" ? v * guests : v;
  };

  const activeItems = ITEMS.filter(isActive);
  const totalMin = activeItems.reduce((s, i) => s + getItemMin(i), 0);
  const totalMax = activeItems.reduce((s, i) => s + getItemMax(i), 0);

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
            Введите стоимость услуг — укажите минимальную и максимальную цену для каждой позиции
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left */}
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
                type="range" min={10} max={300} step={5} value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full" style={{ accentColor: "var(--gold)", height: "2px", cursor: "pointer" }}
              />
              <div className="flex justify-between font-montserrat text-xs mt-2" style={{ color: "rgba(245,237,216,0.3)" }}>
                <span>10</span><span>300</span>
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[{ id: null, label: "Все", icon: "" }, ...CATEGORIES.map(c => ({ id: c.id as string | null, label: c.label, icon: c.icon }))].map((c) => {
                const active = activeCategory === c.id;
                return (
                  <button
                    key={String(c.id)}
                    onClick={() => setActiveCategory(c.id)}
                    className="px-4 py-2 font-montserrat text-xs tracking-widest uppercase transition-all duration-200"
                    style={{
                      background: active ? "var(--gold)" : "transparent",
                      color: active ? "var(--velvet)" : "rgba(245,237,216,0.5)",
                      border: active ? "1px solid var(--gold)" : "1px solid rgba(201,169,110,0.2)",
                    }}
                  >
                    {c.icon} {c.label}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: "rgba(201,169,110,0.35)" }} />
                <span className="font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.4)" }}>Эконом цена</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: "var(--gold)" }} />
                <span className="font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.4)" }}>Премиум цена</span>
              </div>
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visibleItems.map((item) => {
                const minVal = getVal(item, "min");
                const maxVal = getVal(item, "max");
                const hasMin = minVal !== "";
                const hasMax = maxVal !== "";
                const active = hasMin || hasMax;

                return (
                  <div
                    key={item.id}
                    className="p-3 transition-all duration-300"
                    style={{
                      border: active
                        ? "1px solid rgba(201,169,110,0.5)"
                        : "1px solid rgba(201,169,110,0.1)",
                      background: active
                        ? "rgba(201,169,110,0.06)"
                        : "rgba(201,169,110,0.02)",
                    }}
                  >
                    <div className="text-xl mb-2">{item.icon}</div>
                    <div
                      className="font-montserrat leading-tight mb-3"
                      style={{
                        fontSize: "0.68rem",
                        color: active ? "var(--cream)" : "rgba(245,237,216,0.5)",
                      }}
                    >
                      {item.name}
                      {item.id === "menu" && (
                        <span style={{ color: "var(--gold)" }}> ×{guests}</span>
                      )}
                    </div>

                    {/* Min price input */}
                    <div className="mb-2">
                      <div
                        className="font-montserrat text-[9px] tracking-widest uppercase mb-1"
                        style={{ color: hasMin ? "rgba(201,169,110,0.6)" : "rgba(245,237,216,0.2)" }}
                      >
                        Эконом
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={item.defaultMin.toLocaleString("ru-RU")}
                        value={minVal}
                        onChange={(e) => setVal(item.id, "min", e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-transparent outline-none font-cormorant transition-all duration-200"
                        style={{
                          fontSize: "1rem",
                          borderBottom: hasMin
                            ? "1px solid rgba(201,169,110,0.6)"
                            : "1px solid rgba(201,169,110,0.15)",
                          color: hasMin ? "var(--gold-light)" : "rgba(245,237,216,0.15)",
                          paddingBottom: "2px",
                        }}
                        onFocus={(e) => (e.target.style.borderBottomColor = "var(--gold)")}
                        onBlur={(e) => (e.target.style.borderBottomColor = hasMin ? "rgba(201,169,110,0.6)" : "rgba(201,169,110,0.15)")}
                      />
                    </div>

                    {/* Max price input */}
                    <div>
                      <div
                        className="font-montserrat text-[9px] tracking-widest uppercase mb-1"
                        style={{ color: hasMax ? "var(--gold)" : "rgba(245,237,216,0.2)" }}
                      >
                        Премиум
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder={item.defaultMax.toLocaleString("ru-RU")}
                        value={maxVal}
                        onChange={(e) => setVal(item.id, "max", e.target.value.replace(/\D/g, ""))}
                        className="w-full bg-transparent outline-none font-cormorant transition-all duration-200"
                        style={{
                          fontSize: "1rem",
                          borderBottom: hasMax
                            ? "1px solid var(--gold)"
                            : "1px solid rgba(201,169,110,0.15)",
                          color: hasMax ? "var(--gold)" : "rgba(245,237,216,0.15)",
                          paddingBottom: "2px",
                        }}
                        onFocus={(e) => (e.target.style.borderBottomColor = "var(--gold-light)")}
                        onBlur={(e) => (e.target.style.borderBottomColor = hasMax ? "var(--gold)" : "rgba(201,169,110,0.15)")}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: summary */}
          <div className="lg:col-span-1">
            <div
              className="sticky top-24 p-8"
              style={{ border: "1px solid rgba(201,169,110,0.3)", background: "rgba(13,11,8,0.95)" }}
            >
              <div
                className="font-montserrat text-xs tracking-[0.3em] uppercase mb-6 pb-4"
                style={{ color: "var(--gold)", borderBottom: "1px solid rgba(201,169,110,0.15)" }}
              >
                Ваша смета
              </div>

              {/* Items list */}
              <div
                className="mb-6 space-y-3 max-h-72 overflow-y-auto pr-1"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,169,110,0.3) transparent" }}
              >
                {activeItems.length === 0 ? (
                  <div className="font-montserrat text-xs text-center py-8" style={{ color: "rgba(245,237,216,0.2)" }}>
                    Введите цены для<br />нужных услуг
                  </div>
                ) : (
                  activeItems.map((item) => {
                    const minV = getItemMin(item);
                    const maxV = getItemMax(item);
                    return (
                      <div key={item.id} className="flex items-start gap-2">
                        <span className="text-sm flex-shrink-0 mt-0.5">{item.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-montserrat truncate" style={{ fontSize: "0.65rem", color: "rgba(245,237,216,0.55)" }}>
                            {item.name}{item.id === "menu" ? ` ×${guests}` : ""}
                          </div>
                          <div className="flex gap-2 mt-0.5">
                            {minV > 0 && (
                              <span className="font-cormorant text-sm" style={{ color: "rgba(201,169,110,0.7)" }}>
                                {FORMAT(minV)}
                              </span>
                            )}
                            {minV > 0 && maxV > 0 && (
                              <span style={{ color: "rgba(245,237,216,0.2)", fontSize: "0.75rem" }}>—</span>
                            )}
                            {maxV > 0 && (
                              <span className="font-cormorant text-sm" style={{ color: "var(--gold)" }}>
                                {FORMAT(maxV)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {activeItems.length > 0 && (
                <>
                  <div className="gold-divider mb-5" />

                  {/* Totals */}
                  <div className="space-y-3 mb-6">
                    {totalMin > 0 && (
                      <div className="flex justify-between items-baseline">
                        <span className="font-montserrat text-xs tracking-widest uppercase" style={{ color: "rgba(245,237,216,0.35)" }}>
                          Эконом итог
                        </span>
                        <span className="font-cormorant text-xl" style={{ color: "rgba(201,169,110,0.8)" }}>
                          {FORMAT(totalMin)}
                        </span>
                      </div>
                    )}
                    {totalMax > 0 && (
                      <div className="flex justify-between items-baseline">
                        <span className="font-montserrat text-xs tracking-widest uppercase" style={{ color: "rgba(245,237,216,0.35)" }}>
                          Премиум итог
                        </span>
                        <span className="font-cormorant text-2xl" style={{ color: "var(--gold)" }}>
                          {FORMAT(totalMax)}
                        </span>
                      </div>
                    )}
                    {totalMin > 0 && totalMax > 0 && totalMin !== totalMax && (
                      <div
                        className="pt-3 text-center"
                        style={{ borderTop: "1px solid rgba(201,169,110,0.1)" }}
                      >
                        <div className="font-montserrat text-xs tracking-widest uppercase mb-1" style={{ color: "rgba(245,237,216,0.3)" }}>
                          Диапазон
                        </div>
                        <div className="font-cormorant text-base" style={{ color: "rgba(245,237,216,0.5)" }}>
                          {FORMAT(totalMin)} — {FORMAT(totalMax)}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    className="gold-btn w-full py-4 relative mb-3"
                    onClick={() => document.getElementById("contacts")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    <span>Получить расчёт</span>
                  </button>

                  <button
                    className="w-full font-montserrat text-xs tracking-widest uppercase py-2 transition-all"
                    style={{ color: "rgba(245,237,216,0.25)" }}
                    onClick={() => setPrices({})}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(245,237,216,0.5)")}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(245,237,216,0.25)")}
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
