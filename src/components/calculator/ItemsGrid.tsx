import Icon from "@/components/ui/icon";
import { Item, Prices, CATEGORIES } from "./types";

type ItemsGridProps = {
  items: Item[];
  guests: number;
  prices: Prices;
  checked: Set<string>;
  activeCategory: string | null;
  setActiveCategory: (v: string | null) => void;
  setVal: (id: string, key: "min" | "max", val: string) => void;
  toggleCheck: (id: string) => void;
};

export default function ItemsGrid({
  items,
  guests,
  prices,
  checked,
  activeCategory,
  setActiveCategory,
  setVal,
  toggleCheck,
}: ItemsGridProps) {
  const getVal = (id: string, key: "min" | "max") => prices[id]?.[key] ?? "";

  const visibleItems = activeCategory ? items.filter((i) => i.category === activeCategory) : items;

  return (
    <>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {[{ id: null as string | null, label: "Все", icon: "LayoutGrid" }, ...CATEGORIES.map(c => ({ ...c, id: c.id as string | null }))].map((c) => {
          const active = activeCategory === c.id;
          return (
            <button key={String(c.id)} onClick={() => setActiveCategory(c.id)}
              className="px-4 py-2 font-montserrat text-xs tracking-widest uppercase transition-all duration-200 flex items-center gap-2"
              style={{ background: active ? "var(--gold)" : "transparent", color: active ? "var(--velvet)" : "rgba(245,237,216,0.5)", border: active ? "1px solid var(--gold)" : "1px solid rgba(201,169,110,0.2)" }}>
              <Icon name={c.icon} size={12} />
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mb-5 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center" style={{ border: "1px solid rgba(201,169,110,0.5)", background: "var(--gold)" }}>
            <span style={{ color: "var(--velvet)", fontSize: "10px", fontWeight: 700 }}>✓</span>
          </div>
          <span className="font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.35)" }}>Галочка — включить в пример</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "rgba(201,169,110,0.7)" }} />
          <span className="font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.35)" }}>Ваш эконом</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: "var(--gold)" }} />
          <span className="font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.35)" }}>Ваш премиум</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {visibleItems.map((item) => {
          const minVal = getVal(item.id, "min");
          const maxVal = getVal(item.id, "max");
          const hasMin = minVal !== "";
          const hasMax = maxVal !== "";
          const isChecked = checked.has(item.id);
          const active = hasMin || hasMax || isChecked;

          return (
            <div key={item.id} className="p-4 transition-all duration-300 relative"
              style={{
                border: isChecked ? "1px solid rgba(201,169,110,0.6)" : active ? "1px solid rgba(201,169,110,0.35)" : "1px solid rgba(201,169,110,0.1)",
                background: isChecked ? "rgba(201,169,110,0.08)" : active ? "rgba(201,169,110,0.04)" : "rgba(201,169,110,0.02)",
              }}>

              {/* Заголовок: иконка + название + чекбокс */}
              <div className="flex items-start justify-between mb-3 gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Icon name={item.icon} size={15} style={{ color: active ? "var(--gold)" : "rgba(201,169,110,0.35)", flexShrink: 0 }} />
                  <div className="font-montserrat leading-tight" style={{ fontSize: "0.65rem", color: active ? "var(--cream)" : "rgba(245,237,216,0.45)" }}>
                    {item.name}{item.id === "menu" && <span style={{ color: "var(--gold)" }}> ×{guests}</span>}
                  </div>
                </div>
                <button onClick={() => toggleCheck(item.id)}
                  className="flex-shrink-0 w-5 h-5 flex items-center justify-center transition-all duration-200"
                  style={{ border: isChecked ? "1px solid var(--gold)" : "1px solid rgba(201,169,110,0.25)", background: isChecked ? "var(--gold)" : "transparent" }}>
                  {isChecked && <span style={{ color: "var(--velvet)", fontSize: "10px", fontWeight: 700, lineHeight: 1 }}>✓</span>}
                </button>
              </div>

              {/* Две колонки: Пример | Мой расчёт */}
              <div className="grid grid-cols-2 gap-1 mb-1">
                <div className="font-montserrat text-[8px] uppercase tracking-wider text-center pb-1"
                  style={{ color: "rgba(245,237,216,0.55)", borderBottom: "1px solid rgba(201,169,110,0.15)" }}>
                  Пример
                </div>
                <div className="font-montserrat text-[8px] uppercase tracking-wider text-center pb-1"
                  style={{ color: "rgba(201,169,110,0.85)", borderBottom: "1px solid rgba(201,169,110,0.3)" }}>
                  Мой расчёт
                </div>
              </div>

              {/* Эконом строка */}
              <div className="grid grid-cols-2 gap-1 mb-1">
                <div className="px-1 py-1">
                  <div className="font-montserrat text-[7px] uppercase mb-0.5" style={{ color: "rgba(245,237,216,0.65)" }}>Эконом</div>
                  <div className="font-cormorant pb-px" style={{ fontSize: "0.85rem", color: "rgba(245,237,216,0.85)", borderBottom: "1px solid rgba(245,237,216,0.2)" }}>
                    {item.defaultMin.toLocaleString("ru-RU")}
                  </div>
                </div>
                <div className="px-1 py-1">
                  <div className="font-montserrat text-[7px] uppercase mb-0.5" style={{ color: hasMin ? "rgba(201,169,110,0.9)" : "rgba(245,237,216,0.65)" }}>Эконом</div>
                  <div className="relative">
                    <input type="text" inputMode="numeric" placeholder="—" value={minVal}
                      onChange={(e) => setVal(item.id, "min", e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-transparent outline-none font-cormorant transition-all duration-200"
                      style={{ fontSize: "0.85rem", borderBottom: hasMin ? "1px solid rgba(201,169,110,0.6)" : "1px solid rgba(201,169,110,0.25)", color: hasMin ? "rgba(232,213,163,0.9)" : "rgba(245,237,216,0.35)", paddingBottom: "1px" }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "rgba(201,169,110,0.9)")}
                      onBlur={(e) => (e.target.style.borderBottomColor = hasMin ? "rgba(201,169,110,0.6)" : "rgba(201,169,110,0.25)")} />
                  </div>
                </div>
              </div>

              {/* Премиум строка */}
              <div className="grid grid-cols-2 gap-1">
                <div className="px-1 py-1">
                  <div className="font-montserrat text-[7px] uppercase mb-0.5" style={{ color: "rgba(245,237,216,0.65)" }}>Премиум</div>
                  <div className="font-cormorant pb-px" style={{ fontSize: "0.85rem", color: "rgba(245,237,216,0.85)", borderBottom: "1px solid rgba(245,237,216,0.2)" }}>
                    {item.defaultMax.toLocaleString("ru-RU")}
                  </div>
                </div>
                <div className="px-1 py-1">
                  <div className="font-montserrat text-[7px] uppercase mb-0.5" style={{ color: hasMax ? "var(--gold)" : "rgba(245,237,216,0.65)" }}>Премиум</div>
                  <input type="text" inputMode="numeric" placeholder="—" value={maxVal}
                    onChange={(e) => setVal(item.id, "max", e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-transparent outline-none font-cormorant transition-all duration-200"
                    style={{ fontSize: "0.85rem", borderBottom: hasMax ? "1px solid var(--gold)" : "1px solid rgba(201,169,110,0.25)", color: hasMax ? "var(--gold)" : "rgba(245,237,216,0.35)", paddingBottom: "1px" }}
                    onFocus={(e) => (e.target.style.borderBottomColor = "var(--gold-light)")}
                    onBlur={(e) => (e.target.style.borderBottomColor = hasMax ? "var(--gold)" : "rgba(201,169,110,0.25)")} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}