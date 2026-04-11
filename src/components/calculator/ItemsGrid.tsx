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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {visibleItems.map((item) => {
          const minVal = getVal(item.id, "min");
          const maxVal = getVal(item.id, "max");
          const hasMin = minVal !== "";
          const hasMax = maxVal !== "";
          const isChecked = checked.has(item.id);
          const active = hasMin || hasMax || isChecked;

          return (
            <div key={item.id} className="p-3 transition-all duration-300 relative"
              style={{
                border: isChecked ? "1px solid rgba(201,169,110,0.6)" : active ? "1px solid rgba(201,169,110,0.35)" : "1px solid rgba(201,169,110,0.1)",
                background: isChecked ? "rgba(201,169,110,0.08)" : active ? "rgba(201,169,110,0.04)" : "rgba(201,169,110,0.02)",
              }}>

              {/* Checkbox */}
              <button onClick={() => toggleCheck(item.id)}
                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center transition-all duration-200"
                style={{ border: isChecked ? "1px solid var(--gold)" : "1px solid rgba(201,169,110,0.25)", background: isChecked ? "var(--gold)" : "transparent" }}>
                {isChecked && <span style={{ color: "var(--velvet)", fontSize: "10px", fontWeight: 700, lineHeight: 1 }}>✓</span>}
              </button>

              <div className="mb-2 pr-6">
                <Icon name={item.icon} size={16} style={{ color: active ? "var(--gold)" : "rgba(201,169,110,0.35)" }} />
              </div>
              <div className="font-montserrat leading-tight mb-2 pr-2" style={{ fontSize: "0.65rem", color: active ? "var(--cream)" : "rgba(245,237,216,0.45)" }}>
                {item.name}{item.id === "menu" && <span style={{ color: "var(--gold)" }}> ×{guests}</span>}
              </div>

              {/* Пример (только если отмечено) */}
              <div className="overflow-hidden transition-all duration-200" style={{ maxHeight: isChecked ? "24px" : "0", opacity: isChecked ? 1 : 0, marginBottom: isChecked ? "6px" : "0" }}>
                <div className="flex gap-1 items-center">
                  <span className="font-montserrat text-[8px] uppercase flex-shrink-0" style={{ color: "rgba(245,237,216,0.25)" }}>пример</span>
                  <span className="font-cormorant text-xs truncate" style={{ color: "rgba(245,237,216,0.2)" }}>
                    {item.defaultMin === item.defaultMax ? item.defaultMin.toLocaleString("ru-RU") : `${item.defaultMin.toLocaleString("ru-RU")}–${item.defaultMax.toLocaleString("ru-RU")}`}
                  </span>
                </div>
              </div>

              {/* Эконом */}
              <div className="mb-2">
                <div className="font-montserrat text-[8px] uppercase mb-1" style={{ color: hasMin ? "rgba(201,169,110,0.7)" : "rgba(245,237,216,0.18)" }}>эконом</div>
                <input type="text" inputMode="numeric" placeholder={item.defaultMin.toLocaleString("ru-RU")} value={minVal}
                  onChange={(e) => setVal(item.id, "min", e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-transparent outline-none font-cormorant transition-all duration-200"
                  style={{ fontSize: "0.9rem", borderBottom: hasMin ? "1px solid rgba(201,169,110,0.6)" : "1px solid rgba(201,169,110,0.12)", color: hasMin ? "rgba(232,213,163,0.9)" : "rgba(245,237,216,0.12)", paddingBottom: "2px" }}
                  onFocus={(e) => (e.target.style.borderBottomColor = "rgba(201,169,110,0.9)")}
                  onBlur={(e) => (e.target.style.borderBottomColor = hasMin ? "rgba(201,169,110,0.6)" : "rgba(201,169,110,0.12)")} />
              </div>

              {/* Премиум */}
              <div>
                <div className="font-montserrat text-[8px] uppercase mb-1" style={{ color: hasMax ? "var(--gold)" : "rgba(245,237,216,0.18)" }}>премиум</div>
                <input type="text" inputMode="numeric" placeholder={item.defaultMax.toLocaleString("ru-RU")} value={maxVal}
                  onChange={(e) => setVal(item.id, "max", e.target.value.replace(/\D/g, ""))}
                  className="w-full bg-transparent outline-none font-cormorant transition-all duration-200"
                  style={{ fontSize: "0.9rem", borderBottom: hasMax ? "1px solid var(--gold)" : "1px solid rgba(201,169,110,0.12)", color: hasMax ? "var(--gold)" : "rgba(245,237,216,0.12)", paddingBottom: "2px" }}
                  onFocus={(e) => (e.target.style.borderBottomColor = "var(--gold-light)")}
                  onBlur={(e) => (e.target.style.borderBottomColor = hasMax ? "var(--gold)" : "rgba(201,169,110,0.12)")} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}