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

  const buildShareText = () => {
    const totalMin = totalUserMin || totalExampleMin;
    const totalMax = totalUserMax || totalExampleMax;
    const lines = estimateItems.map((r) => `${r.icon} ${r.name}: ${r.econom ? FORMAT(r.econom) : "—"} / ${r.premium ? FORMAT(r.premium) : "—"}`).join("\n");
    return `Студия декора Эльвиры Даутовой\nСмета торжества (${guests} гостей)\n\n${lines}\n\nИтого: ${totalMin ? FORMAT(totalMin) : "—"} – ${totalMax ? FORMAT(totalMax) : "—"}\n\nСмета ориентировочная, уточняется при встрече.`;
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

  return (
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
