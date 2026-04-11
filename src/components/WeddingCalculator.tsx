import { useState } from "react";
import Icon from "@/components/ui/icon";

const SEND_ESTIMATE_URL = "https://functions.poehali.dev/e9f41fef-c047-4cd3-ab99-becbe1197f36";

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

const FORMAT = (n: number) => n.toLocaleString("ru-RU", { maximumFractionDigits: 0 }) + " ₽";

type Prices = Record<string, { min: string; max: string }>;

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

  const mult = (item: Item) => item.id === "menu" ? guests : 1;
  const checkedItems = ITEMS.filter((i) => checked.has(i.id));

  const userMin = (item: Item) => { const v = getVal(item.id, "min"); return v ? parseInt(v) * mult(item) : 0; };
  const userMax = (item: Item) => { const v = getVal(item.id, "max"); return v ? parseInt(v) * mult(item) : 0; };

  const totalExampleMin = checkedItems.reduce((s, i) => s + i.defaultMin * mult(i), 0);
  const totalExampleMax = checkedItems.reduce((s, i) => s + i.defaultMax * mult(i), 0);
  const hasAnyMin = ITEMS.some((i) => getVal(i.id, "min") !== "");
  const hasAnyMax = ITEMS.some((i) => getVal(i.id, "max") !== "");
  const totalUserMin = ITEMS.reduce((s, i) => s + userMin(i), 0);
  const totalUserMax = ITEMS.reduce((s, i) => s + userMax(i), 0);

  const visibleItems = activeCategory ? ITEMS.filter((i) => i.category === activeCategory) : ITEMS;

  // Собираем строки для сметы (отмеченные + с ценами)
  const estimateItems = ITEMS
    .filter((i) => checked.has(i.id) || getVal(i.id, "min") !== "" || getVal(i.id, "max") !== "")
    .map((i) => ({
      icon: i.icon,
      name: i.name + (i.id === "menu" ? ` ×${guests}` : ""),
      econom: getVal(i.id, "min") ? parseInt(getVal(i.id, "min")) * mult(i) : (checked.has(i.id) ? i.defaultMin * mult(i) : 0),
      premium: getVal(i.id, "max") ? parseInt(getVal(i.id, "max")) * mult(i) : (checked.has(i.id) ? i.defaultMax * mult(i) : 0),
    }));

  const buildHtmlContent = () => {
    const rows = estimateItems.map((r) =>
      `<tr>
        <td style="padding:10px 14px;border-bottom:1px solid #2a2218;color:#e8d9b5;">${r.icon} ${r.name}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #2a2218;color:#c9a84c;text-align:right;">${r.econom ? FORMAT(r.econom) : "—"}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #2a2218;color:#f0c96a;text-align:right;">${r.premium ? FORMAT(r.premium) : "—"}</td>
      </tr>`
    ).join("");
    return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"/>
    <title>Смета — Студия декора Эльвиры Даутовой</title>
    <style>
      body{margin:0;padding:32px;background:#0d0b08;font-family:Georgia,serif;color:#e8d9b5;}
      h1{color:#f0c96a;font-weight:normal;letter-spacing:2px;margin:0 0 4px;}
      .sub{color:#9c8050;font-size:12px;letter-spacing:4px;text-transform:uppercase;margin:0 0 24px;}
      table{width:100%;border-collapse:collapse;border:1px solid #3a2f1a;}
      th{background:#1a1408;padding:10px 14px;text-align:left;color:#9c8050;font-size:11px;letter-spacing:2px;text-transform:uppercase;font-weight:normal;border-bottom:1px solid #3a2f1a;}
      th:not(:first-child){text-align:right;}
      .total td{background:#1a1408;color:#f0c96a;font-size:15px;font-weight:bold;border-top:1px solid #3a2f1a;padding:12px 14px;}
      .total td:not(:first-child){text-align:right;}
      .footer{margin-top:20px;color:#6b5a3a;font-size:11px;font-style:italic;}
      @media print{body{background:#fff;color:#000;}h1{color:#8B6914;} th,td{color:#000 !important;} }
    </style></head><body>
    <div style="color:#c9a84c;letter-spacing:6px;margin-bottom:16px;">✦ &nbsp; ✦ &nbsp; ✦</div>
    <h1>Студия декора Эльвиры Даутовой</h1>
    <p class="sub">Смета торжества</p>
    <p style="color:#9c8050;font-size:13px;margin:0 0 16px;">Гостей: <span style="color:#e8d9b5;">${guests} чел.</span></p>
    <table>
      <thead><tr><th>Услуга</th><th>Эконом</th><th>Премиум</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot class="total"><tr>
        <td>Итого</td>
        <td style="color:#c9a84c;">${totalUserMin || totalExampleMin ? FORMAT(totalUserMin || totalExampleMin) : "—"}</td>
        <td style="color:#f0c96a;">${totalUserMax || totalExampleMax ? FORMAT(totalUserMax || totalExampleMax) : "—"}</td>
      </tr></tfoot>
    </table>
    <p class="footer">Смета носит ориентировочный характер и уточняется при личной встрече.</p>
    </body></html>`;
  };

  const buildPlainText = () => {
    const lines = estimateItems.map((r) =>
      `${r.name}\t${r.econom ? FORMAT(r.econom) : "—"}\t${r.premium ? FORMAT(r.premium) : "—"}`
    ).join("\n");
    const totalMin = totalUserMin || totalExampleMin;
    const totalMax = totalUserMax || totalExampleMax;
    return `Студия декора Эльвиры Даутовой\nСмета торжества\nГостей: ${guests} чел.\n\nУслуга\tЭконом\tПремиум\n${lines}\n\nИтого\t${totalMin ? FORMAT(totalMin) : "—"}\t${totalMax ? FORMAT(totalMax) : "—"}\n\nСмета носит ориентировочный характер и уточняется при личной встрече.`;
  };

  const handleDownloadHtml = () => {
    const html = buildHtmlContent();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smeta.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadWord = () => {
    const rows = estimateItems.map((r) =>
      `<tr><td>${r.icon} ${r.name}</td><td>${r.econom ? FORMAT(r.econom) : "—"}</td><td>${r.premium ? FORMAT(r.premium) : "—"}</td></tr>`
    ).join("");
    const totalMin = totalUserMin || totalExampleMin;
    const totalMax = totalUserMax || totalExampleMax;
    const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="UTF-8"/><title>Смета</title></head><body>
      <h1 style="color:#8B6914;font-family:Georgia,serif;">Студия декора Эльвиры Даутовой</h1>
      <p style="font-family:Georgia,serif;color:#555;">Гостей: ${guests} чел.</p>
      <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;font-family:Georgia,serif;">
        <thead><tr style="background:#f5edd0;"><th>Услуга</th><th>Эконом</th><th>Премиум</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr style="background:#f5edd0;font-weight:bold;"><td>Итого</td><td>${totalMin ? FORMAT(totalMin) : "—"}</td><td>${totalMax ? FORMAT(totalMax) : "—"}</td></tr></tfoot>
      </table>
      <p style="font-family:Georgia,serif;color:#999;font-style:italic;margin-top:16px;">Смета носит ориентировочный характер и уточняется при личной встрече.</p>
    </body></html>`;
    const blob = new Blob([docHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smeta.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    const rows = estimateItems.map((r) =>
      `<tr><td>${r.icon} ${r.name}</td><td>${r.econom || ""}</td><td>${r.premium || ""}</td></tr>`
    ).join("");
    const totalMin = totalUserMin || totalExampleMin;
    const totalMax = totalUserMax || totalExampleMax;
    const xlsHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"/></head><body>
      <table>
        <tr><td colspan="3"><b>Студия декора Эльвиры Даутовой</b></td></tr>
        <tr><td colspan="3">Гостей: ${guests} чел.</td></tr>
        <tr><td></td></tr>
        <tr><th>Услуга</th><th>Эконом (₽)</th><th>Премиум (₽)</th></tr>
        ${rows}
        <tr><td><b>Итого</b></td><td><b>${totalMin || ""}</b></td><td><b>${totalMax || ""}</b></td></tr>
      </table>
    </body></html>`;
    const blob = new Blob([xlsHtml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "smeta.xls";
    a.click();
    URL.revokeObjectURL(url);
  };

  const buildShareText = () => {
    const totalMin = totalUserMin || totalExampleMin;
    const totalMax = totalUserMax || totalExampleMax;
    const lines = estimateItems.map((r) => `${r.icon} ${r.name}: ${r.econom ? FORMAT(r.econom) : "—"} / ${r.premium ? FORMAT(r.premium) : "—"}`).join("\n");
    return `Студия декора Эльвиры Даутовой\nСмета торжества (${guests} гостей)\n\n${lines}\n\nИтого: ${totalMin ? FORMAT(totalMin) : "—"} – ${totalMax ? FORMAT(totalMax) : "—"}\n\nСмета ориентировочная, уточняется при встрече.`;
  };

  const handleShareVk = () => {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://vk.com/share.php?comment=${text}`, "_blank");
  };

  const handleShareTelegram = () => {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${text}`, "_blank");
  };

  const handleShareWhatsapp = () => {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleSendEmail = async () => {
    if (!emailInput.trim()) return;
    setSendStatus("sending");
    try {
      const res = await fetch(SEND_ESTIMATE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput.trim(),
          guests,
          items: estimateItems,
          totalEconom: totalUserMin || totalExampleMin,
          totalPremium: totalUserMax || totalExampleMax,
        }),
      });
      if (res.ok) setSendStatus("sent");
      else setSendStatus("error");
    } catch {
      setSendStatus("error");
    }
  };

  const hasAnything = checked.size > 0 || hasAnyMin || hasAnyMax;

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

            {/* Guests */}
            <div className="mb-8 p-6" style={{ border: "1px solid rgba(201,169,110,0.2)", background: "rgba(201,169,110,0.03)" }}>
              <div className="flex items-center justify-between mb-4">
                <span className="font-montserrat text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Количество гостей</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setGuests(g => Math.max(1, g - 1))}
                    className="w-8 h-8 flex items-center justify-center transition-all duration-200 font-cormorant text-lg"
                    style={{ border: "1px solid rgba(201,169,110,0.4)", color: "var(--gold)", background: "transparent", lineHeight: 1 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,169,110,0.1)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >−</button>
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={guests}
                    onChange={(e) => {
                      const v = Math.min(500, Math.max(1, Number(e.target.value) || 1));
                      setGuests(v);
                    }}
                    className="bg-transparent outline-none font-cormorant text-3xl text-center"
                    style={{ color: "var(--gold)", width: "72px", border: "none", MozAppearance: "textfield" } as React.CSSProperties}
                  />
                  <button
                    onClick={() => setGuests(g => Math.min(500, g + 1))}
                    className="w-8 h-8 flex items-center justify-center transition-all duration-200 font-cormorant text-lg"
                    style={{ border: "1px solid rgba(201,169,110,0.4)", color: "var(--gold)", background: "transparent", lineHeight: 1 }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,169,110,0.1)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >+</button>
                </div>
              </div>
              <input type="range" min={1} max={500} step={1} value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full" style={{ accentColor: "var(--gold)", height: "2px", cursor: "pointer" }} />
              <div className="flex justify-between font-montserrat text-xs mt-2" style={{ color: "rgba(245,237,216,0.3)" }}>
                <span>1</span><span>500</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
              {[{ id: null as string | null, label: "Все", icon: "" }, ...CATEGORIES.map(c => ({ ...c, id: c.id as string | null }))].map((c) => {
                const active = activeCategory === c.id;
                return (
                  <button key={String(c.id)} onClick={() => setActiveCategory(c.id)}
                    className="px-4 py-2 font-montserrat text-xs tracking-widest uppercase transition-all duration-200"
                    style={{ background: active ? "var(--gold)" : "transparent", color: active ? "var(--velvet)" : "rgba(245,237,216,0.5)", border: active ? "1px solid var(--gold)" : "1px solid rgba(201,169,110,0.2)" }}>
                    {c.icon} {c.label}
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

                    <div className="text-xl mb-1 pr-6">{item.icon}</div>
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
          </div>

          {/* Right: summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 p-8" style={{ border: "1px solid rgba(201,169,110,0.3)", background: "rgba(13,11,8,0.95)" }}>
              <div className="font-montserrat text-xs tracking-[0.3em] uppercase mb-6 pb-4" style={{ color: "var(--gold)", borderBottom: "1px solid rgba(201,169,110,0.15)" }}>
                Сравнение бюджетов
              </div>

              {/* 3 columns */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="text-center p-3" style={{ background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.08)" }}>
                  <div className="font-montserrat text-[9px] tracking-widest uppercase mb-2" style={{ color: "rgba(245,237,216,0.3)" }}>Пример</div>
                  {checked.size > 0 ? (
                    <>
                      <div className="font-cormorant text-sm mb-1" style={{ color: "rgba(245,237,216,0.4)" }}>{FORMAT(totalExampleMin)}</div>
                      {totalExampleMin !== totalExampleMax && <div className="font-cormorant text-sm" style={{ color: "rgba(245,237,216,0.4)" }}>{FORMAT(totalExampleMax)}</div>}
                      <div className="font-montserrat mt-1" style={{ fontSize: "0.6rem", color: "rgba(245,237,216,0.2)" }}>{checked.size} поз.</div>
                    </>
                  ) : (
                    <div className="font-montserrat text-xs py-2" style={{ color: "rgba(245,237,216,0.15)" }}>отметьте ✓</div>
                  )}
                </div>

                <div className="text-center p-3" style={{ background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.08)" }}>
                  <div className="font-montserrat text-[9px] tracking-widest uppercase mb-2" style={{ color: "rgba(201,169,110,0.7)" }}>Эконом</div>
                  {hasAnyMin ? <div className="font-cormorant text-sm" style={{ color: "rgba(232,213,163,0.9)" }}>{FORMAT(totalUserMin)}</div>
                    : <div className="font-montserrat text-xs py-2" style={{ color: "rgba(245,237,216,0.15)" }}>—</div>}
                </div>

                <div className="text-center p-3" style={{ background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.08)" }}>
                  <div className="font-montserrat text-[9px] tracking-widest uppercase mb-2" style={{ color: "var(--gold)" }}>Премиум</div>
                  {hasAnyMax ? <div className="font-cormorant text-sm" style={{ color: "var(--gold)" }}>{FORMAT(totalUserMax)}</div>
                    : <div className="font-montserrat text-xs py-2" style={{ color: "rgba(245,237,216,0.15)" }}>—</div>}
                </div>
              </div>

              {/* Разница */}
              {hasAnyMin && hasAnyMax && (
                <div className="mb-5 p-3 text-center" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.15)" }}>
                  <div className="font-montserrat text-[9px] tracking-widest uppercase mb-1" style={{ color: "rgba(245,237,216,0.3)" }}>Разница</div>
                  <div className="font-cormorant text-lg" style={{ color: "var(--gold-light)" }}>{FORMAT(totalUserMax - totalUserMin)}</div>
                </div>
              )}

              {/* Детализация */}
              <div className="font-montserrat text-[9px] tracking-widest uppercase mb-2" style={{ color: "rgba(245,237,216,0.2)" }}>Детализация</div>
              <div className="mb-5 space-y-2 max-h-44 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,169,110,0.3) transparent" }}>
                {estimateItems.length === 0 ? (
                  <div className="font-montserrat text-xs text-center py-3" style={{ color: "rgba(245,237,216,0.15)" }}>Отметьте позиции галочкой</div>
                ) : estimateItems.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-xs flex-shrink-0">{item.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-montserrat truncate" style={{ fontSize: "0.6rem", color: "rgba(245,237,216,0.4)" }}>{item.name}</div>
                      <div className="flex gap-2">
                        {item.econom > 0 && <span className="font-cormorant text-xs" style={{ color: "rgba(201,169,110,0.7)" }}>{FORMAT(item.econom)}</span>}
                        {item.econom > 0 && item.premium > 0 && <span style={{ color: "rgba(245,237,216,0.2)", fontSize: "0.6rem" }}>|</span>}
                        {item.premium > 0 && <span className="font-cormorant text-xs" style={{ color: "var(--gold)" }}>{FORMAT(item.premium)}</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="gold-divider mb-5" />

              {/* Кнопки действий */}
              {hasAnything && (
                <>
                  {/* Скачать */}
                  <div className="font-montserrat text-[9px] tracking-widest uppercase mb-2" style={{ color: "rgba(245,237,216,0.3)" }}>Скачать смету</div>
                  <div className="flex gap-2 mb-3">
                    {[
                      { label: "HTML", onClick: handleDownloadHtml },
                      { label: "Word", onClick: handleDownloadWord },
                      { label: "Excel", onClick: handleDownloadExcel },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        className="flex-1 flex items-center justify-center gap-1 py-2 font-montserrat text-xs tracking-wider uppercase transition-all duration-200"
                        style={{ border: "1px solid rgba(201,169,110,0.4)", color: "var(--gold-light)", background: "transparent" }}
                        onClick={btn.onClick}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--gold)"; (e.currentTarget as HTMLElement).style.color = "var(--gold)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,110,0.4)"; (e.currentTarget as HTMLElement).style.color = "var(--gold-light)"; }}
                      >
                        <Icon name="Download" size={11} />
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Поделиться */}
                  <div className="font-montserrat text-[9px] tracking-widest uppercase mb-2" style={{ color: "rgba(245,237,216,0.3)" }}>Поделиться</div>
                  <div className="flex gap-2 mb-3">
                    {[
                      { label: "ВКонтакте", onClick: handleShareVk },
                      { label: "Telegram", onClick: handleShareTelegram },
                      { label: "WhatsApp", onClick: handleShareWhatsapp },
                    ].map((btn) => (
                      <button
                        key={btn.label}
                        className="flex-1 flex items-center justify-center gap-1 py-2 font-montserrat tracking-wide transition-all duration-200"
                        style={{ border: "1px solid rgba(201,169,110,0.25)", color: "rgba(245,237,216,0.45)", background: "transparent", fontSize: "0.55rem" }}
                        onClick={btn.onClick}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,110,0.5)"; (e.currentTarget as HTMLElement).style.color = "var(--gold-light)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,110,0.25)"; (e.currentTarget as HTMLElement).style.color = "rgba(245,237,216,0.45)"; }}
                      >
                        <Icon name="Share2" size={10} />
                        {btn.label}
                      </button>
                    ))}
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="email@example.com"
                        value={emailInput}
                        onChange={(e) => { setEmailInput(e.target.value); setSendStatus("idle"); }}
                        className="flex-1 bg-transparent outline-none font-montserrat text-xs py-3 px-3 transition-all"
                        style={{ border: "1px solid rgba(201,169,110,0.3)", color: "var(--cream)" }}
                        onFocus={(e) => (e.target.style.borderColor = "var(--gold)")}
                        onBlur={(e) => (e.target.style.borderColor = "rgba(201,169,110,0.3)")}
                      />
                      <button
                        className="px-4 py-3 transition-all duration-200 flex items-center"
                        style={{ background: sendStatus === "sent" ? "rgba(201,169,110,0.2)" : "var(--gold)", color: "var(--velvet)" }}
                        onClick={handleSendEmail}
                        disabled={sendStatus === "sending" || sendStatus === "sent"}
                      >
                        {sendStatus === "sending" ? <Icon name="Loader" size={14} /> :
                         sendStatus === "sent" ? <Icon name="Check" size={14} /> :
                         <Icon name="Send" size={14} />}
                      </button>
                    </div>
                    {sendStatus === "sent" && (
                      <div className="font-montserrat text-xs mt-2" style={{ color: "rgba(201,169,110,0.7)" }}>✓ Смета отправлена на почту</div>
                    )}
                    {sendStatus === "error" && (
                      <div className="font-montserrat text-xs mt-2" style={{ color: "rgba(255,100,100,0.7)" }}>Ошибка отправки — проверьте email</div>
                    )}
                  </div>
                </>
              )}

              <button
                className="w-full font-montserrat text-xs tracking-widest uppercase py-2 transition-all"
                style={{ color: "rgba(245,237,216,0.2)" }}
                onClick={() => { setPrices({}); setChecked(new Set()); setSendStatus("idle"); setEmailInput(""); }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(245,237,216,0.5)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(245,237,216,0.2)")}
              >
                Сбросить всё
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}