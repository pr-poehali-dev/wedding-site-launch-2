import { useState } from "react";
import { ITEMS, Prices } from "./calculator/types";
import GuestsSelector from "./calculator/GuestsSelector";
import ItemsGrid from "./calculator/ItemsGrid";
import EstimateSidebar from "./calculator/EstimateSidebar";

export default function WeddingCalculator() {
  const [prices, setPrices] = useState<Prices>({});
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [guests, setGuests] = useState(50);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState("");
  const [sendStatus, setSendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const getVal = (id: string, key: "min" | "max") => prices[id]?.[key] ?? "";
  const setVal = (id: string, key: "min" | "max", val: string) =>
    setPrices((p) => ({ ...p, [id]: { min: p[id]?.min ?? "", max: p[id]?.max ?? "", [key]: val } }));
  const toggleCheck = (id: string) =>
    setChecked((p) => {
      const n = new Set(p);
      if (n.has(id)) { n.delete(id); } else { n.add(id); }
      return n;
    });

  const mult = (item: typeof ITEMS[0]) => item.id === "menu" ? guests : 1;
  const checkedItems = ITEMS.filter((i) => checked.has(i.id));

  const userMin = (item: typeof ITEMS[0]) => { const v = getVal(item.id, "min"); return v ? parseInt(v) * mult(item) : 0; };
  const userMax = (item: typeof ITEMS[0]) => { const v = getVal(item.id, "max"); return v ? parseInt(v) * mult(item) : 0; };

  const totalExampleMin = checkedItems.reduce((s, i) => s + i.defaultMin * mult(i), 0);
  const totalExampleMax = checkedItems.reduce((s, i) => s + i.defaultMax * mult(i), 0);
  const hasAnyMin = ITEMS.some((i) => getVal(i.id, "min") !== "");
  const hasAnyMax = ITEMS.some((i) => getVal(i.id, "max") !== "");
  const itemsWithMin = ITEMS.filter((i) => getVal(i.id, "min") !== "");
  const itemsWithMax = ITEMS.filter((i) => getVal(i.id, "max") !== "");
  const totalUserMin = itemsWithMin.reduce((s, i) => s + userMin(i), 0);
  const totalUserMax = itemsWithMax.reduce((s, i) => s + userMax(i), 0);

  const estimateItems = ITEMS
    .filter((i) => checked.has(i.id) || getVal(i.id, "min") !== "" || getVal(i.id, "max") !== "")
    .map((i) => {
      const exEconom = checked.has(i.id) ? i.defaultMin * mult(i) : 0;
      const exPremium = checked.has(i.id) ? i.defaultMax * mult(i) : 0;
      const usEconom = getVal(i.id, "min") ? parseInt(getVal(i.id, "min")) * mult(i) : 0;
      const usPremium = getVal(i.id, "max") ? parseInt(getVal(i.id, "max")) * mult(i) : 0;
      return {
        icon: i.icon,
        name: i.name + (i.id === "menu" ? ` ×${guests}` : ""),
        exampleEconom: exEconom,
        examplePremium: exPremium,
        userEconom: usEconom,
        userPremium: usPremium,
        econom: usEconom || exEconom,
        premium: usPremium || exPremium,
      };
    });

  const hasAnything = checked.size > 0 || hasAnyMin || hasAnyMax;

  const handleReset = () => {
    setPrices({});
    setChecked(new Set());
    setSendStatus("idle");
    setEmailInput("");
  };

  return (
    <section id="calculator" className="py-24 px-6" style={{ background: "rgba(0,0,0,0.3)" }}>
      <div className="max-w-7xl mx-auto">

        <div className="text-center mb-14">
          <div className="font-montserrat text-xs tracking-[0.4em] uppercase mb-4" style={{ color: "var(--gold)" }}>✦ Оценка стоимости ✦</div>
          <h2 className="section-title mb-4" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>Калькулятор свадьбы</h2>
          <div className="gold-divider max-w-xs mx-auto mb-6" />
          <p className="font-montserrat text-sm" style={{ color: "rgba(245,237,216,0.45)" }}>
            Отметьте нужные позиции галочкой — пример посчитается по ним. Введите свои цены для сравнения
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left */}
          <div className="lg:col-span-2">
            <GuestsSelector guests={guests} setGuests={setGuests} />
            <ItemsGrid
              items={ITEMS}
              guests={guests}
              prices={prices}
              checked={checked}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              setVal={setVal}
              toggleCheck={toggleCheck}
            />
          </div>

          {/* Right */}
          <EstimateSidebar
            guests={guests}
            checked={checked}
            estimateItems={estimateItems}
            totalExampleMin={totalExampleMin}
            totalExampleMax={totalExampleMax}
            totalUserMin={totalUserMin}
            totalUserMax={totalUserMax}
            hasAnyMin={hasAnyMin}
            hasAnyMax={hasAnyMax}
            hasAnything={hasAnything}
            emailInput={emailInput}
            sendStatus={sendStatus}
            setEmailInput={setEmailInput}
            setSendStatus={setSendStatus}
            onReset={handleReset}
          />

        </div>
      </div>
    </section>
  );
}