import React, { useRef, useState, useCallback, useEffect } from "react";
import { generateId, TABLE_COLORS, HallShape, HALL_PRESETS } from "./seating-editor/tableShapes";
import EditorLeftSidebar from "./seating-editor/EditorLeftSidebar";
import EditorRightSidebar from "./seating-editor/EditorRightSidebar";
import EditorToolbar from "./seating-editor/EditorToolbar";
import HallCanvas from "./seating-editor/HallCanvas";
import { renderHallPng } from "./seating-editor/renderHallPng";
import { exportGuestsDocxWithMap } from "./guest-manager/exportGuests";

const PLANS_API = "https://functions.poehali.dev/8192888d-d171-4174-9179-bae0a5946737";
const GUESTS_API = "https://functions.poehali.dev/5a8e58c4-106e-46da-8f0c-84e078f2432c";

export type TableShape = "round" | "rect" | "oval" | "presidium";

export interface TableItem {
  id: string;
  shape: TableShape;
  label: string;
  seats: number;
  x: number;
  y: number;
  color: string;
  scale?: number; // 0.5 – 2.0, default 1
}

export interface GuestItem {
  id: string;
  name: string;
  tableId?: string | null;
  seatIndex?: number;
  rsvp?: "pending" | "confirmed" | "declined";
  phone?: string;
  note?: string;
}

interface SeatingEditorProps {
  plan: { id: string; title: string };
  tables: TableItem[];
  guests: GuestItem[];
  onUpdateTables: (tables: TableItem[]) => void;
  onSeatGuest: (guestId: string, tableId: string | null) => void;
  onReorderGuests?: (guests: GuestItem[]) => void;
  onOpenGuests?: () => void;
  sessionId: string | null;
  planId: string;
}

export default function SeatingEditor({
  plan,
  tables,
  guests,
  onUpdateTables,
  onSeatGuest,
  onReorderGuests,
  onOpenGuests,
  sessionId,
  planId,
}: SeatingEditorProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragging, setDragging] = useState<{
    tableId: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const [dragOverTableId, setDragOverTableId] = useState<string | null>(null);
  const [draggingGuest, setDraggingGuest] = useState<string | null>(null);
  const [guestSearch, setGuestSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hallShape, setHallShape] = useState<HallShape>("rect-h");
  const [hallCustomW, setHallCustomW] = useState<number | null>(null);
  const [hallCustomH, setHallCustomH] = useState<number | null>(null);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Размер зала — кастомный (если меняли ручкой) или по пресету
  const hallPreset = HALL_PRESETS.find((p) => p.shape === hallShape) ?? HALL_PRESETS[1];
  const HALL_W = hallCustomW ?? hallPreset.w;
  const HALL_H = hallCustomH ?? hallPreset.h;

  const handleResizeHall = useCallback((w: number, h: number) => {
    setHallCustomW(w);
    setHallCustomH(h);
  }, []);

  const selectedTable = tables.find((t) => t.id === selectedId) ?? null;

  // getSvgPoint — оставляем для совместимости (не используется в drag)
  const getSvgPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      return {
        x: (clientX - rect.left) * (HALL_W / rect.width),
        y: (clientY - rect.top) * (HALL_H / rect.height),
      };
    },
    [HALL_W, HALL_H]
  );

  const scheduleSave = useCallback(
    (updatedTables: TableItem[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        setSaving(true);
        try {
          const headers: Record<string, string> = { "Content-Type": "application/json" };
          if (sessionId) headers["X-Session-Id"] = sessionId;
          await fetch(PLANS_API, {
            method: "POST",
            headers,
            body: JSON.stringify({ action: "update", planId, tables: updatedTables }),
          });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        } catch {
          // silent
        } finally {
          setSaving(false);
        }
      }, 1500);
    },
    [sessionId, planId]
  );

  const draggingRef = useRef(dragging);
  draggingRef.current = dragging;
  const tablesRef = useRef(tables);
  tablesRef.current = tables;
  const hallWRef = useRef(HALL_W);
  hallWRef.current = HALL_W;
  const hallHRef = useRef(HALL_H);
  hallHRef.current = HALL_H;

  const getSvgPointFromEvent = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    // SVG рендерится в натуральном размере (width=hallW, без масштабирования)
    // поэтому scale = 1, просто вычитаем левый-верхний угол SVG
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }, []);

  const handleTableMouseDown = useCallback(
    (e: React.MouseEvent, tableId: string) => {
      e.stopPropagation();
      e.preventDefault();
      setSelectedId(tableId);
      const pt = getSvgPointFromEvent(e.clientX, e.clientY);
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;
      // Сохраняем offset в момент mousedown
      const offsetX = pt.x - table.x;
      const offsetY = pt.y - table.y;
      setDragging({ tableId, offsetX, offsetY });

      const onMove = (ev: MouseEvent) => {
        const pt2 = getSvgPointFromEvent(ev.clientX, ev.clientY);
        const hw = hallWRef.current;
        const hh = hallHRef.current;
        const newX = Math.max(30, Math.min(hw - 30, pt2.x - offsetX));
        const newY = Math.max(30, Math.min(hh - 30, pt2.y - offsetY));
        onUpdateTables(tablesRef.current.map((t) => t.id === tableId ? { ...t, x: newX, y: newY } : t));
      };
      const onUp = () => {
        scheduleSave(tablesRef.current);
        setDragging(null);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [tables, getSvgPointFromEvent, onUpdateTables, scheduleSave]
  );

  // Заглушки — drag через window listeners
  const handleSvgMouseMove = useCallback((_e: React.MouseEvent) => {}, []);
  const handleSvgMouseUp = useCallback(() => {}, []);

  const handleSvgClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as SVGElement).tagName === "svg" || (e.target as SVGElement).tagName === "rect") {
      setSelectedId(null);
    }
  }, []);

  const addTable = useCallback(
    (shape: TableShape) => {
      const newTable: TableItem = {
        id: generateId(),
        shape,
        label: shape === "presidium"
          ? "Президиум"
          : `Стол ${tables.filter((t) => t.shape !== "presidium").length + 1}`,
        seats: shape === "presidium" ? 8 : 6,
        x: 60 + Math.random() * Math.max(40, HALL_W - 120),
        y: 50 + Math.random() * Math.max(40, HALL_H - 100),
        color: TABLE_COLORS[0].value,
      };
      const updated = [...tables, newTable];
      onUpdateTables(updated);
      setSelectedId(newTable.id);
      scheduleSave(updated);
    },
    [tables, onUpdateTables, scheduleSave, HALL_W, HALL_H]
  );

  const updateSelected = useCallback(
    (patch: Partial<TableItem>) => {
      if (!selectedId) return;
      const updated = tables.map((t) =>
        t.id === selectedId ? { ...t, ...patch } : t
      );
      onUpdateTables(updated);
      scheduleSave(updated);
    },
    [selectedId, tables, onUpdateTables, scheduleSave]
  );

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    const updated = tables.filter((t) => t.id !== selectedId);
    onUpdateTables(updated);
    setSelectedId(null);
    scheduleSave(updated);
  }, [selectedId, tables, onUpdateTables, scheduleSave]);

  const handleTableDoubleClick = useCallback(
    (e: React.MouseEvent, tableId: string) => {
      e.stopPropagation();
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;
      setInlineEditId(tableId);
      setInlineEditValue(table.label);
      setDragging(null);
    },
    [tables]
  );

  const commitInlineEdit = useCallback(() => {
    if (!inlineEditId) return;
    const trimmed = inlineEditValue.trim();
    if (trimmed) {
      const updated = tables.map((t) =>
        t.id === inlineEditId ? { ...t, label: trimmed } : t
      );
      onUpdateTables(updated);
      scheduleSave(updated);
    }
    setInlineEditId(null);
  }, [inlineEditId, inlineEditValue, tables, onUpdateTables, scheduleSave]);

  const handleGuestDragStart = useCallback((guestId: string) => {
    setDraggingGuest(guestId);
  }, []);

  const handleTableDragEnter = useCallback((tableId: string) => {
    if (draggingGuest) setDragOverTableId(tableId);
  }, [draggingGuest]);

  const handleTableDragLeave = useCallback(() => {
    setDragOverTableId(null);
  }, []);

  const handleTableDrop = useCallback(
    async (tableId: string) => {
      if (!draggingGuest) return;
      const guestId = draggingGuest;
      setDragOverTableId(null);
      setDraggingGuest(null);
      // Проверяем лимит мест
      const targetTable = tables.find((t) => t.id === tableId);
      const seatsInTable = guests.filter((g) => g.tableId === tableId && g.id !== guestId);
      const nextIndex = seatsInTable.length;
      if (targetTable && nextIndex >= targetTable.seats) return; // лимит мест исчерпан
      if (onReorderGuests) {
        const updated = guests.map((g) =>
          g.id === guestId ? { ...g, tableId, seatIndex: nextIndex } : g
        );
        onReorderGuests(updated);
      }
      onSeatGuest(guestId, tableId);
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (sessionId) headers["X-Session-Id"] = sessionId;
        await fetch(GUESTS_API, {
          method: "POST",
          headers,
          body: JSON.stringify({
            action: "update",
            planId,
            guestId,
            tableId,
          }),
        });
      } catch {
        // silent
      }
    },
    [draggingGuest, guests, onSeatGuest, onReorderGuests, sessionId, planId]
  );

  const downloadPng = useCallback(async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const dataUrl = await renderHallPng(svg, HALL_W, HALL_H, false);
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${plan.title || "seating"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [plan.title, HALL_W, HALL_H]);

  const downloadDocx = useCallback(async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const pngBase64 = await renderHallPng(svg, HALL_W, HALL_H, true);
    await exportGuestsDocxWithMap(guests, tables, plan.title, pngBase64, HALL_W, HALL_H);
  }, [guests, tables, plan.title, HALL_W, HALL_H]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const unassignedCount = guests.filter((g) => !g.tableId).length;

  // Touch drag handlers for HallCanvas
  const handleTouchTableMove = useCallback((tableId: string, x: number, y: number) => {
    onUpdateTables(tables.map((t) => t.id === tableId ? { ...t, x, y } : t));
  }, [tables, onUpdateTables]);

  const handleTouchTableEnd = useCallback(() => {
    scheduleSave(tables);
  }, [tables, scheduleSave]);

  const handleTableTap = useCallback((tableId: string) => {
    setSelectedId((prev) => prev === tableId ? null : tableId);
  }, []);

  // Mobile: seat guest by tap — с проверкой лимита
  const handleSeatGuestMobile = useCallback((guestId: string, tableId: string | null) => {
    if (tableId) {
      const targetTable = tables.find((t) => t.id === tableId);
      const currentCount = guests.filter((g) => g.tableId === tableId && g.id !== guestId).length;
      if (targetTable && currentCount >= targetTable.seats) return; // лимит
    }
    const seatsInTable = tableId
      ? guests.filter((g) => g.tableId === tableId && g.id !== guestId).length
      : 0;
    if (onReorderGuests) {
      onReorderGuests(guests.map((g) =>
        g.id === guestId ? { ...g, tableId, seatIndex: seatsInTable } : g
      ));
    }
    onSeatGuest(guestId, tableId);
  }, [guests, tables, onReorderGuests, onSeatGuest]);

  const hallCanvasProps = {
    svgRef,
    tables,
    guests,
    hallW: HALL_W,
    hallH: HALL_H,
    onResizeHall: handleResizeHall,
    selectedId,
    dragging,
    dragOverTableId,
    draggingGuest,
    inlineEditId,
    inlineEditValue,
    onSvgMouseMove: handleSvgMouseMove,
    onSvgMouseUp: handleSvgMouseUp,
    onSvgClick: handleSvgClick,
    onTableMouseDown: handleTableMouseDown,
    onTableDoubleClick: handleTableDoubleClick,
    onTableDragEnter: handleTableDragEnter,
    onTableDragLeave: handleTableDragLeave,
    onTableDrop: handleTableDrop,
    onInlineEditChange: setInlineEditValue,
    onInlineEditCommit: commitInlineEdit,
    onInlineEditCancel: () => setInlineEditId(null),
  };

  return (
    <div
      className="flex flex-col font-montserrat"
      style={{ background: "var(--velvet)", color: "var(--cream)" }}
    >
      <EditorToolbar
        planTitle={plan.title}
        saving={saving}
        saved={saved}
        unassignedCount={unassignedCount}
        onOpenGuests={onOpenGuests}
        onDownloadPng={downloadPng}
        onDownloadDocx={downloadDocx}
      />

      {/* ── Desktop layout (md+) ── */}
      <div className="hidden md:flex" style={{ minHeight: "calc(100vh - 110px)" }}>
        <EditorLeftSidebar
          selectedTable={selectedTable}
          hallShape={hallShape}
          onAddTable={addTable}
          onUpdateSelected={updateSelected}
          onDeleteSelected={deleteSelected}
          onHallShapeChange={(shape) => { setHallShape(shape); setHallCustomW(null); setHallCustomH(null); }}
        />
        <HallCanvas {...hallCanvasProps} />
        <EditorRightSidebar
          guests={guests}
          tables={tables}
          guestSearch={guestSearch}
          onGuestSearchChange={setGuestSearch}
          onGuestDragStart={handleGuestDragStart}
          onGuestDragEnd={() => setDraggingGuest(null)}
          onReorderGuests={onReorderGuests}
        />
      </div>

      {/* ── Mobile layout ── */}
      <div className="flex md:hidden flex-col">

        {/* Зал — фиксированная высота, скроллируется пальцем как карта */}
        <div style={{ width: "100%", height: 260, flexShrink: 0, background: "#110f0a", overflow: "hidden" }}>
          <HallCanvas
            {...hallCanvasProps}
            onTouchTableMove={handleTouchTableMove}
            onTouchTableEnd={handleTouchTableEnd}
            onTableTap={handleTableTap}
          />
        </div>

        {/* Форма зала + добавить стол */}
        <div style={{ background: "#0d0b08", borderTop: "1px solid #c9a96e30", padding: "10px 12px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--gold)", flexShrink: 0 }}>Форма зала</p>
            <div style={{ display: "flex", gap: 4 }}>
              {HALL_PRESETS.map((preset) => (
                <button key={preset.shape}
                  onClick={() => { setHallShape(preset.shape); setHallCustomW(null); setHallCustomH(null); }}
                  style={{
                    padding: "4px 8px", borderRadius: 4, fontSize: 11,
                    background: hallShape === preset.shape ? "#2a2010" : "#1a160f",
                    border: `1px solid ${hallShape === preset.shape ? "#c9a96e" : "#c9a96e30"}`,
                    color: hallShape === preset.shape ? "var(--gold)" : "#c9a96e60",
                  }}>
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--gold)" }}>Добавить стол</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {([
              { shape: "round" as TableShape, label: "Круглый" },
              { shape: "rect" as TableShape, label: "Прямоуг." },
              { shape: "oval" as TableShape, label: "Овальный" },

              { shape: "presidium" as TableShape, label: "Президиум" },
            ]).map(({ shape, label }) => (
              <button key={shape} onClick={() => addTable(shape)}
                style={{ background: "#1a160f", border: "1px solid #c9a96e40", color: "var(--cream)", padding: "6px 10px", borderRadius: 5, fontSize: 12 }}>
                {label}
              </button>
            ))}
          </div>

          {/* Настройки выбранного стола */}
          {selectedTable && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ color: "var(--gold)", fontSize: 11, flexShrink: 0 }}>Выбран:</span>
              <input
                style={{ flex: 1, minWidth: 80, background: "#1a160f", border: "1px solid #c9a96e40", color: "var(--cream)", padding: "4px 8px", borderRadius: 4, fontSize: 12, outline: "none" }}
                value={selectedTable.label}
                onChange={(e) => updateSelected({ label: e.target.value })}
              />
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button onClick={() => updateSelected({ seats: Math.max(1, selectedTable.seats - 1) })}
                  style={{ width: 28, height: 28, background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--gold)", borderRadius: 4, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>−</button>
                <span style={{ color: "var(--cream)", fontSize: 13, minWidth: 22, textAlign: "center" }}>{selectedTable.seats}</span>
                <button onClick={() => updateSelected({ seats: Math.min(30, selectedTable.seats + 1) })}
                  style={{ width: 28, height: 28, background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--gold)", borderRadius: 4, fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
              <button onClick={deleteSelected}
                style={{ background: "#2a0e0e", border: "1px solid #7a2020", color: "#e07070", padding: "4px 10px", borderRadius: 4, fontSize: 12 }}>
                Удалить
              </button>
            </div>
          )}
        </div>

        {/* Гости по столам с кнопкой «Посадить» */}
        <div style={{ background: "#0a0907", flexShrink: 0 }}>
          <div style={{ padding: "10px 12px 6px", borderTop: "1px solid #c9a96e20", borderBottom: "1px solid #c9a96e15" }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--gold)" }}>Гости по столам</p>
            {selectedTable && (
              <p style={{ color: "#c9a96e80", fontSize: 11, marginTop: 2 }}>
                Нажмите «→ сюда» рядом с гостем, чтобы посадить за «{selectedTable.label}»
              </p>
            )}
          </div>

          {/* Поиск */}
          <div style={{ padding: "6px 12px" }}>
            <input
              style={{ width: "100%", background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--cream)", padding: "6px 10px", borderRadius: 5, fontSize: 13, outline: "none", boxSizing: "border-box" }}
              placeholder="Поиск гостей..."
              value={guestSearch}
              onChange={(e) => setGuestSearch(e.target.value)}
            />
          </div>

          {/* Блоки по столам */}
          {(() => {
            const sorted = [...tables].sort((a, b) => {
              if (a.shape === "presidium") return -1;
              if (b.shape === "presidium") return 1;
              return a.label.localeCompare(b.label, "ru");
            });
            const blocks = [
              ...sorted.map((t) => ({
                tableId: t.id,
                label: t.shape === "presidium" ? `№0 ${t.label}` : t.label,
                seats: t.seats,
                guests: guests.filter((g) => g.tableId === t.id).sort((a, b) => (a.seatIndex ?? 999) - (b.seatIndex ?? 999)),
              })),
              {
                tableId: null as string | null,
                label: "Без стола",
                seats: null,
                guests: guests.filter((g) => !g.tableId),
              },
            ].filter((b) => !guestSearch || b.guests.some((g) => g.name.toLowerCase().includes(guestSearch.toLowerCase())));

            return blocks.map((block) => (
              <div key={block.tableId ?? "__none__"} style={{ borderBottom: "1px solid #c9a96e12" }}>
                {/* Заголовок блока */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px 4px", background: "#0f0d0a" }}>
                  <span style={{ color: "var(--gold)", fontSize: 12, fontWeight: 600, flex: 1 }}>{block.label}</span>
                  {(() => {
                    const isFull = block.seats != null && block.guests.length >= block.seats;
                    return (
                      <span style={{ color: isFull ? "#e07070" : "#c9a96e50", fontSize: 11, fontWeight: isFull ? 700 : 400 }}>
                        {block.guests.length}{block.seats != null ? `/${block.seats}` : ""}
                        {isFull ? " ●" : ""}
                      </span>
                    );
                  })()}
                  {block.tableId && selectedId !== block.tableId && (
                    <button
                      onClick={() => setSelectedId(block.tableId)}
                      style={{ background: "#1a160f", border: "1px solid #c9a96e40", color: "var(--gold)", padding: "3px 8px", borderRadius: 4, fontSize: 11 }}>
                      Выбрать
                    </button>
                  )}
                  {block.tableId && selectedId === block.tableId && (
                    <span style={{ color: "#7ab87a", fontSize: 11 }}>✓ выбран</span>
                  )}
                </div>
                {/* Гости блока */}
                <div style={{ padding: "2px 8px 6px" }}>
                  {block.guests.filter((g) => !guestSearch || g.name.toLowerCase().includes(guestSearch.toLowerCase())).map((guest, gIdx) => {
                    const filteredList = block.guests.filter((g) => !guestSearch || g.name.toLowerCase().includes(guestSearch.toLowerCase()));
                    const canUp = gIdx > 0 && block.tableId;
                    const canDown = gIdx < filteredList.length - 1 && block.tableId;
                    const moveMobile = (dir: -1 | 1) => {
                      if (!onReorderGuests || !block.tableId) return;
                      const arr = [...block.guests];
                      const realIdx = arr.findIndex((g) => g.id === guest.id);
                      const swapIdx = realIdx + dir;
                      if (swapIdx < 0 || swapIdx >= arr.length) return;
                      [arr[realIdx], arr[swapIdx]] = [arr[swapIdx], arr[realIdx]];
                      const withIndex = arr.map((g, i) => ({ ...g, seatIndex: i }));
                      const merged = guests.map((g) => {
                        if (g.tableId !== block.tableId) return g;
                        return withIndex.find((wg) => wg.id === g.id) ?? g;
                      });
                      onReorderGuests(merged);
                    };
                    return (
                      <div key={guest.id}
                        style={{
                          display: "flex", alignItems: "center", gap: 6,
                          padding: "8px 10px", marginBottom: 3, borderRadius: 5,
                          background: selectedId && guest.tableId !== selectedId ? "#1e1a10" : "#161209",
                          border: `1px solid ${selectedId && guest.tableId !== selectedId ? "#c9a96e40" : "#c9a96e15"}`,
                        }}>
                        {/* Номер */}
                        {block.tableId && (
                          <span style={{ color: "#c9a96e80", fontSize: 11, minWidth: 16, flexShrink: 0 }}>{gIdx + 1}.</span>
                        )}
                        <span
                          style={{ flex: 1, color: "var(--cream)", fontSize: 13 }}
                        >{guest.name}</span>
                        {selectedId && guest.tableId !== selectedId && (() => {
                          const selTable = tables.find((t) => t.id === selectedId);
                          const selCount = guests.filter((g) => g.tableId === selectedId).length;
                          const isFull = selTable && selCount >= selTable.seats;
                          return (
                            <button
                              disabled={!!isFull}
                              onClick={(e) => { e.stopPropagation(); if (!isFull) handleSeatGuestMobile(guest.id, selectedId!); }}
                              style={{ background: isFull ? "#1a160f" : "#1a160f", border: `1px solid ${isFull ? "#c9a96e20" : "#c9a96e60"}`, color: isFull ? "#c9a96e30" : "var(--gold)", fontSize: 12, padding: "3px 8px", borderRadius: 4, flexShrink: 0, cursor: isFull ? "not-allowed" : "pointer" }}
                              title={isFull ? "Стол заполнен" : "Посадить за этот стол"}
                            >{isFull ? "●" : "→ сюда"}</button>
                          );
                        })()}
                        {/* Стрелки ↑↓ */}
                        {block.tableId && (
                          <div style={{ display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
                            <button onClick={() => moveMobile(-1)} disabled={!canUp}
                              style={{ background: "none", border: "none", cursor: canUp ? "pointer" : "default", color: canUp ? "#c9a96e" : "#c9a96e20", fontSize: 12, padding: "1px 3px", lineHeight: 1 }}>▲</button>
                            <button onClick={() => moveMobile(1)} disabled={!canDown}
                              style={{ background: "none", border: "none", cursor: canDown ? "pointer" : "default", color: canDown ? "#c9a96e" : "#c9a96e20", fontSize: 12, padding: "1px 3px", lineHeight: 1 }}>▼</button>
                          </div>
                        )}
                        {guest.tableId && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSeatGuestMobile(guest.id, null); }}
                            style={{ color: "#c9a96e40", fontSize: 13, background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}
                            title="Убрать со стола">✕</button>
                        )}
                      </div>
                    );
                  })}
                  {block.guests.length === 0 && (
                    <p style={{ color: "#c9a96e30", fontSize: 12, padding: "4px 2px" }}>Пусто</p>
                  )}
                </div>
              </div>
            ));
          })()}
        </div>
      </div>
    </div>
  );
}