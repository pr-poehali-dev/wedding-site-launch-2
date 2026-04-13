import Icon from "@/components/ui/icon";
import { EstimateRow, FORMAT, SEND_ESTIMATE_URL } from "./types";

type EstimateSidebarProps = {
  guests: number;
  checked: Set<string>;
  estimateItems: EstimateRow[];
  totalExampleMin: number;
  totalExampleMax: number;
  totalUserMin: number;
  totalUserMax: number;
  hasAnyMin: boolean;
  hasAnyMax: boolean;
  hasAnything: boolean;
  emailInput: string;
  sendStatus: "idle" | "sending" | "sent" | "error";
  setEmailInput: (v: string) => void;
  setSendStatus: (v: "idle" | "sending" | "sent" | "error") => void;
  onReset: () => void;
};

export default function EstimateSidebar({
  guests,
  checked,
  estimateItems,
  totalExampleMin,
  totalExampleMax,
  totalUserMin,
  totalUserMax,
  hasAnyMin,
  hasAnyMax,
  hasAnything,
  emailInput,
  sendStatus,
  setEmailInput,
  setSendStatus,
  onReset,
}: EstimateSidebarProps) {

  const buildHtmlContent = () => {
    const myItems = estimateItems.filter(r => r.userEconom > 0 || r.userPremium > 0);
    const rows = myItems.map((r) =>
      `<tr>
        <td style="padding:10px 14px;border-bottom:1px solid #2a2218;color:#e8d9b5;">${r.icon} ${r.name}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #2a2218;color:#c9a84c;text-align:right;">${r.userEconom ? FORMAT(r.userEconom) : "—"}</td>
        <td style="padding:10px 14px;border-bottom:1px solid #2a2218;color:#f0c96a;text-align:right;">${r.userPremium ? FORMAT(r.userPremium) : "—"}</td>
      </tr>`
    ).join("");
    return `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8"/>
    <title>Моя смета — Студия декора Эльвиры Даутовой</title>
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
    <p class="sub">Моя смета</p>
    <p style="color:#9c8050;font-size:13px;margin:0 0 16px;">Гостей: <span style="color:#e8d9b5;">${guests} чел.</span></p>
    <table>
      <thead><tr><th>Услуга</th><th>Эконом</th><th>Премиум</th></tr></thead>
      <tbody>${rows}</tbody>
      <tfoot class="total"><tr>
        <td>Итого</td>
        <td style="color:#c9a84c;">${totalUserMin ? FORMAT(totalUserMin) : "—"}</td>
        <td style="color:#f0c96a;">${totalUserMax ? FORMAT(totalUserMax) : "—"}</td>
      </tr></tfoot>
    </table>
    <p class="footer">Смета носит ориентировочный характер и уточняется при личной встрече.</p>
    </body></html>`;
  };

  const buildShareText = () => {
    const myItems = estimateItems.filter(r => r.userEconom > 0 || r.userPremium > 0);
    const lines = myItems.map((r) => `${r.icon} ${r.name}: ${r.userEconom ? FORMAT(r.userEconom) : "—"} / ${r.userPremium ? FORMAT(r.userPremium) : "—"}`).join("\n");
    return `Студия декора Эльвиры Даутовой\nМоя смета (${guests} гостей)\n\n${lines}\n\nИтого: ${totalUserMin ? FORMAT(totalUserMin) : "—"} – ${totalUserMax ? FORMAT(totalUserMax) : "—"}\n\nСмета ориентировочная, уточняется при встрече.`;
  };

  const handleDownloadHtml = () => {
    const html = buildHtmlContent();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "moya-smeta.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadWord = () => {
    const myItems = estimateItems.filter(r => r.userEconom > 0 || r.userPremium > 0);
    const rows = myItems.map((r) =>
      `<tr><td>${r.icon} ${r.name}</td><td>${r.userEconom ? FORMAT(r.userEconom) : "—"}</td><td>${r.userPremium ? FORMAT(r.userPremium) : "—"}</td></tr>`
    ).join("");
    const docHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="UTF-8"/><title>Моя смета</title></head><body>
      <h1 style="color:#8B6914;font-family:Georgia,serif;">Студия декора Эльвиры Даутовой</h1>
      <p style="font-family:Georgia,serif;color:#555;">Гостей: ${guests} чел.</p>
      <table border="1" cellpadding="8" cellspacing="0" style="width:100%;border-collapse:collapse;font-family:Georgia,serif;">
        <thead><tr style="background:#f5edd0;"><th>Услуга</th><th>Эконом</th><th>Премиум</th></tr></thead>
        <tbody>${rows}</tbody>
        <tfoot><tr style="background:#f5edd0;font-weight:bold;"><td>Итого</td><td>${totalUserMin ? FORMAT(totalUserMin) : "—"}</td><td>${totalUserMax ? FORMAT(totalUserMax) : "—"}</td></tr></tfoot>
      </table>
      <p style="font-family:Georgia,serif;color:#999;font-style:italic;margin-top:16px;">Смета носит ориентировочный характер и уточняется при личной встрече.</p>
    </body></html>`;
    const blob = new Blob([docHtml], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "moya-smeta.doc";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    const myItems = estimateItems.filter(r => r.userEconom > 0 || r.userPremium > 0);
    const rows = myItems.map((r) =>
      `<tr><td>${r.icon} ${r.name}</td><td>${r.userEconom || ""}</td><td>${r.userPremium || ""}</td></tr>`
    ).join("");
    const xlsHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel"><head><meta charset="UTF-8"/></head><body>
      <table>
        <tr><td colspan="3"><b>Студия декора Эльвиры Даутовой</b></td></tr>
        <tr><td colspan="3">Гостей: ${guests} чел.</td></tr>
        <tr><td></td></tr>
        <tr><th>Услуга</th><th>Эконом (₽)</th><th>Премиум (₽)</th></tr>
        ${rows}
        <tr><td><b>Итого</b></td><td><b>${totalUserMin || ""}</b></td><td><b>${totalUserMax || ""}</b></td></tr>
      </table>
    </body></html>`;
    const blob = new Blob([xlsHtml], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "moya-smeta.xls";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareVk = () => {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://vk.com/share.php?comment=${text}`, "_blank");
  };

  const handleShareMax = () => {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://connect.ok.ru/offer?url=${encodeURIComponent(window.location.href)}&description=${text}`, "_blank");
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

  return (
    <div className="lg:col-span-1">
      <div className="sticky top-24 p-8" style={{ border: "1px solid rgba(201,169,110,0.3)", background: "rgba(13,11,8,0.95)" }}>
        <div className="font-montserrat text-xs tracking-[0.3em] uppercase mb-5 pb-4" style={{ color: "var(--gold)", borderBottom: "1px solid rgba(201,169,110,0.15)" }}>
          Сравнение бюджетов
        </div>

        {/* Две колонки: Пример и Мой расчёт */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          {/* Заголовки-кнопки */}
          <div className="text-center py-2 font-montserrat text-[9px] tracking-widest uppercase"
            style={{ border: "1px solid rgba(201,169,110,0.4)", color: "rgba(245,237,216,0.75)", background: "transparent" }}>
            Пример
          </div>
          <div className="text-center py-2 font-montserrat text-[9px] tracking-widest uppercase"
            style={{ border: "1px solid var(--gold)", color: "var(--velvet)", background: "var(--gold)" }}>
            Мой расчёт
          </div>
        </div>

        {/* Строка Эконом */}
        <div className="grid grid-cols-2 gap-2 mb-1">
          <div className="text-center py-2 px-2" style={{ background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.08)" }}>
            <div className="font-montserrat mb-1" style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: "rgba(245,237,216,0.6)", textTransform: "uppercase" }}>Эконом</div>
            {checked.size > 0
              ? <div className="font-cormorant" style={{ fontSize: "1rem", color: "rgba(245,237,216,0.75)" }}>{FORMAT(totalExampleMin)}</div>
              : <div className="font-cormorant" style={{ fontSize: "1rem", color: "rgba(245,237,216,0.3)" }}>—</div>}
          </div>
          <div className="text-center py-2 px-2" style={{ background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.12)" }}>
            <div className="font-montserrat mb-1" style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: "rgba(201,169,110,0.9)", textTransform: "uppercase" }}>Эконом</div>
            {hasAnyMin
              ? <div className="font-cormorant" style={{ fontSize: "1rem", color: "rgba(232,213,163,0.9)" }}>{FORMAT(totalUserMin)}</div>
              : <div className="font-cormorant" style={{ fontSize: "1rem", color: "rgba(245,237,216,0.15)" }}>—</div>}
          </div>
        </div>

        {/* Строка Премиум */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="text-center py-2 px-2" style={{ background: "rgba(201,169,110,0.04)", border: "1px solid rgba(201,169,110,0.08)" }}>
            <div className="font-montserrat mb-1" style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: "rgba(245,237,216,0.6)", textTransform: "uppercase" }}>Премиум</div>
            {checked.size > 0
              ? <div className="font-cormorant" style={{ fontSize: "1rem", color: "rgba(245,237,216,0.75)" }}>{FORMAT(totalExampleMax)}</div>
              : <div className="font-cormorant" style={{ fontSize: "1rem", color: "rgba(245,237,216,0.3)" }}>—</div>}
          </div>
          <div className="text-center py-2 px-2" style={{ background: "rgba(201,169,110,0.06)", border: "1px solid rgba(201,169,110,0.2)" }}>
            <div className="font-montserrat mb-1" style={{ fontSize: "0.6rem", letterSpacing: "0.15em", color: "var(--gold)", textTransform: "uppercase" }}>Премиум</div>
            {hasAnyMax
              ? <div className="font-cormorant" style={{ fontSize: "1rem", color: "var(--gold)" }}>{FORMAT(totalUserMax)}</div>
              : <div className="font-cormorant" style={{ fontSize: "1rem", color: "rgba(245,237,216,0.15)" }}>—</div>}
          </div>
        </div>

        {/* Подпись */}
        <div className="font-montserrat text-center mb-5" style={{ fontSize: "0.55rem", color: "rgba(245,237,216,0.2)", letterSpacing: "0.1em" }}>
          {checked.size > 0 ? `${checked.size} позиций — базовые цены` : "Отметьте позиции галочкой"}
        </div>

        {/* Детализация */}
        <div className="font-montserrat text-[9px] tracking-widest uppercase mb-2" style={{ color: "rgba(245,237,216,0.5)" }}>Детализация</div>

        {estimateItems.length === 0 ? (
          <div className="font-montserrat text-xs text-center py-3 mb-5" style={{ color: "rgba(245,237,216,0.15)" }}>Отметьте позиции галочкой</div>
        ) : (
          <div className="mb-5 max-h-64 overflow-y-auto pr-1" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(201,169,110,0.3) transparent" }}>
            {/* Шапка колонок */}
            <div className="grid grid-cols-[1fr_auto_auto] gap-x-2 mb-1 pb-1" style={{ borderBottom: "1px solid rgba(201,169,110,0.1)" }}>
              <div />
              <div className="font-montserrat text-[7px] uppercase tracking-widest text-center w-14" style={{ color: "rgba(245,237,216,0.55)" }}>Пример</div>
              <div className="font-montserrat text-[7px] uppercase tracking-widest text-center w-14" style={{ color: "rgba(201,169,110,0.85)" }}>Мой расчёт</div>
            </div>

            {/* Строки позиций */}
            <div className="space-y-1">
              {estimateItems.map((item, i) => (
                <div key={i}>
                  {/* Название */}
                  <div className="flex items-center gap-1 mb-0.5 mt-1">
                    <Icon name={item.icon} size={9} style={{ color: "rgba(201,169,110,0.6)", flexShrink: 0 }} />
                    <span className="font-montserrat truncate" style={{ fontSize: "0.58rem", color: "rgba(245,237,216,0.9)" }}>{item.name}</span>
                  </div>
                  {/* Эконом / Премиум в двух колонках */}
                  <div className="grid grid-cols-[1fr_auto_auto] gap-x-2">
                    <div className="font-montserrat" style={{ fontSize: "0.55rem", color: "rgba(245,237,216,0.6)" }}>Эконом</div>
                    <div className="font-cormorant text-xs text-center w-14" style={{ color: "rgba(245,237,216,0.6)" }}>
                      {item.exampleEconom > 0 ? FORMAT(item.exampleEconom) : "—"}
                    </div>
                    <div className="font-cormorant text-xs text-center w-14" style={{ color: item.userEconom > 0 ? "rgba(232,213,163,1)" : "rgba(245,237,216,0.35)" }}>
                      {item.userEconom > 0 ? FORMAT(item.userEconom) : "—"}
                    </div>
                  </div>
                  <div className="grid grid-cols-[1fr_auto_auto] gap-x-2">
                    <div className="font-montserrat" style={{ fontSize: "0.55rem", color: "rgba(245,237,216,0.6)" }}>Премиум</div>
                    <div className="font-cormorant text-xs text-center w-14" style={{ color: "rgba(245,237,216,0.6)" }}>
                      {item.examplePremium > 0 ? FORMAT(item.examplePremium) : "—"}
                    </div>
                    <div className="font-cormorant text-xs text-center w-14" style={{ color: item.userPremium > 0 ? "var(--gold)" : "rgba(245,237,216,0.35)" }}>
                      {item.userPremium > 0 ? FORMAT(item.userPremium) : "—"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                { label: "MAX", onClick: handleShareMax },
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

        {estimateItems.some(i => i.userEconom > 0 || i.userPremium > 0) && (
          <>
            <div className="gold-divider mb-4 mt-2" />
            <div className="font-montserrat text-[9px] tracking-widest uppercase mb-3" style={{ color: "rgba(201,169,110,0.6)" }}>Моя детализация</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th className="font-montserrat text-left pb-2" style={{ fontSize: "0.55rem", letterSpacing: "0.15em", color: "rgba(245,237,216,0.3)", fontWeight: 400, borderBottom: "1px solid rgba(201,169,110,0.1)", paddingRight: 6 }}>Позиция</th>
                    <th className="font-montserrat text-right pb-2" style={{ fontSize: "0.55rem", letterSpacing: "0.15em", color: "rgba(201,169,110,0.7)", fontWeight: 400, borderBottom: "1px solid rgba(201,169,110,0.1)", paddingRight: 6 }}>Эконом</th>
                    <th className="font-montserrat text-right pb-2" style={{ fontSize: "0.55rem", letterSpacing: "0.15em", color: "var(--gold)", fontWeight: 400, borderBottom: "1px solid rgba(201,169,110,0.1)" }}>Премиум</th>
                  </tr>
                </thead>
                <tbody>
                  {estimateItems.filter(i => i.userEconom > 0 || i.userPremium > 0).map((item, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(201,169,110,0.06)" }}>
                      <td className="py-1.5 font-montserrat" style={{ fontSize: "0.6rem", color: "rgba(245,237,216,0.75)", paddingRight: 6 }}>
                        <span className="flex items-center gap-1">
                          <Icon name={item.icon} size={9} style={{ color: "rgba(201,169,110,0.6)", flexShrink: 0 }} />
                          <span className="truncate" style={{ maxWidth: 80, color: "rgba(245,237,216,0.9)" }}>{item.name}</span>
                        </span>
                      </td>
                      <td className="py-1.5 font-cormorant text-right" style={{ fontSize: "0.7rem", color: "rgba(201,169,110,1)", paddingRight: 6, whiteSpace: "nowrap" }}>
                        {item.userEconom > 0 ? FORMAT(item.userEconom) : "—"}
                      </td>
                      <td className="py-1.5 font-cormorant text-right" style={{ fontSize: "0.7rem", color: "var(--gold)", whiteSpace: "nowrap" }}>
                        {item.userPremium > 0 ? FORMAT(item.userPremium) : "—"}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ borderTop: "1px solid rgba(201,169,110,0.2)" }}>
                    <td className="pt-2 font-montserrat" style={{ fontSize: "0.55rem", color: "rgba(245,237,216,0.7)", letterSpacing: "0.1em" }}>ИТОГО</td>
                    <td className="pt-2 font-cormorant text-right" style={{ fontSize: "0.75rem", color: "rgba(201,169,110,0.9)", paddingRight: 6, whiteSpace: "nowrap" }}>
                      {totalUserMin ? FORMAT(totalUserMin) : "—"}
                    </td>
                    <td className="pt-2 font-cormorant text-right" style={{ fontSize: "0.75rem", color: "var(--gold)", whiteSpace: "nowrap" }}>
                      {totalUserMax ? FORMAT(totalUserMax) : "—"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="gold-divider mt-4 mb-4" />
          </>
        )}

        <button
          className="w-full font-montserrat text-xs tracking-widest uppercase py-2 transition-all"
          style={{ color: "rgba(245,237,216,0.2)" }}
          onClick={onReset}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(245,237,216,0.5)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(245,237,216,0.2)")}
        >
          Сбросить всё
        </button>
      </div>
    </div>
  );
}