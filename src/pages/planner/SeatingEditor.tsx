import React, { useRef, useState, useCallback, useEffect } from "react";
import { generateId, TABLE_COLORS, HallShape, HALL_PRESETS } from "./seating-editor/tableShapes";
import EditorLeftSidebar from "./seating-editor/EditorLeftSidebar";
import EditorRightSidebar from "./seating-editor/EditorRightSidebar";
import EditorToolbar from "./seating-editor/EditorToolbar";
import HallCanvas from "./seating-editor/HallCanvas";

const PLANS_API = "https://functions.poehali.dev/8192888d-d171-4174-9179-bae0a5946737";
const GUESTS_API = "https://functions.poehali.dev/5a8e58c4-106e-46da-8f0c-84e078f2432c";

export type TableShape = "round" | "rect" | "oval" | "row" | "presidium";

export interface TableItem {
  id: string;
  shape: TableShape;
  label: string;
  seats: number;
  x: number;
  y: number;
  color: string;
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
  const [hallW, setHallW] = useState(900);
  const [hallH, setHallH] = useState(500);
  const [inlineEditId, setInlineEditId] = useState<string | null>(null);
  const [inlineEditValue, setInlineEditValue] = useState("");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync hall shape preset → dimensions (only when preset changes)
  useEffect(() => {
    const preset = HALL_PRESETS.find((p) => p.shape === hallShape);
    if (preset) { setHallW(preset.w); setHallH(preset.h); }
  }, [hallShape]);

  const HALL_W = hallW;
  const HALL_H = hallH;

  const selectedTable = tables.find((t) => t.id === selectedId) ?? null;

  const getSvgPoint = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return { x: 0, y: 0 };
      const rect = svg.getBoundingClientRect();
      const scaleX = HALL_W / rect.width;
      const scaleY = HALL_H / rect.height;
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
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

  const handleTableMouseDown = useCallback(
    (e: React.MouseEvent, tableId: string) => {
      e.stopPropagation();
      setSelectedId(tableId);
      const pt = getSvgPoint(e.clientX, e.clientY);
      const table = tables.find((t) => t.id === tableId);
      if (!table) return;
      setDragging({ tableId, offsetX: pt.x - table.x, offsetY: pt.y - table.y });
    },
    [tables, getSvgPoint]
  );

  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!dragging) return;
      const pt = getSvgPoint(e.clientX, e.clientY);
      const newX = Math.max(20, Math.min(HALL_W - 20, pt.x - dragging.offsetX));
      const newY = Math.max(20, Math.min(HALL_H - 20, pt.y - dragging.offsetY));
      onUpdateTables(
        tables.map((t) =>
          t.id === dragging.tableId ? { ...t, x: newX, y: newY } : t
        )
      );
    },
    [dragging, tables, onUpdateTables, getSvgPoint, HALL_W, HALL_H]
  );

  const handleSvgMouseUp = useCallback(() => {
    if (dragging) {
      scheduleSave(tables);
      setDragging(null);
    }
  }, [dragging, tables, scheduleSave]);

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
        seats: shape === "row" ? 10 : shape === "presidium" ? 8 : 6,
        x: 150 + Math.random() * (HALL_W - 300),
        y: 100 + Math.random() * (HALL_H - 200),
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
      // Assign seatIndex = next available seat in that table
      const seatsInTable = guests.filter((g) => g.tableId === tableId && g.id !== guestId);
      const nextIndex = seatsInTable.length;
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

    const scale = 2;
    const w = HALL_W * scale;
    const h = HALL_H * scale;

    // Serialize SVG and add explicit width/height so canvas renders fully
    const serializer = new XMLSerializer();
    let svgStr = serializer.serializeToString(svg);
    // Ensure width/height attributes are set (viewBox alone is not enough for canvas)
    svgStr = svgStr.replace(
      /(<svg[^>]*?)(\s*>)/,
      `$1 width="${w}" height="${h}"$2`
    );

    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#110f0a";
      ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${plan.title || "seating"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }, [plan.title, HALL_W, HALL_H]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const unassignedCount = guests.filter((g) => !g.tableId).length;
  const hallCanvasProps = {
    svgRef,
    tables,
    guests,
    hallW: HALL_W,
    hallH: HALL_H,
    onResizeHall: (w: number, h: number) => { setHallW(w); setHallH(h); },
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
      className="flex flex-col h-full min-h-screen font-montserrat"
      style={{ background: "var(--velvet)", color: "var(--cream)" }}
    >
      <EditorToolbar
        planTitle={plan.title}
        saving={saving}
        saved={saved}
        unassignedCount={unassignedCount}
        onOpenGuests={onOpenGuests}
        onDownloadPng={downloadPng}
      />

      {/* ── Desktop layout (md+) ── */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        <EditorLeftSidebar
          selectedTable={selectedTable}
          hallShape={hallShape}
          onAddTable={addTable}
          onUpdateSelected={updateSelected}
          onDeleteSelected={deleteSelected}
          onHallShapeChange={setHallShape}
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
      <div className="flex md:hidden flex-col" style={{ flex: 1 }}>

        {/* Зал — фиксированная высота */}
        <div style={{ height: "45vw", minHeight: 180, maxHeight: 320, flexShrink: 0, position: "relative" }}>
          <HallCanvas {...hallCanvasProps} />
        </div>

        {/* Кнопки добавления столов */}
        <div
          style={{
            background: "#0d0b08",
            borderTop: "1px solid #c9a96e30",
            borderBottom: "1px solid #c9a96e20",
            padding: "8px 12px",
            flexShrink: 0,
          }}
        >
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--gold)" }}>
            Добавить стол
          </p>
          <div className="flex flex-wrap gap-1.5">
            {([
              { shape: "round" as TableShape, label: "Круглый", icon: "●" },
              { shape: "rect" as TableShape, label: "Прямоуг.", icon: "▬" },
              { shape: "oval" as TableShape, label: "Овальный", icon: "⬭" },
              { shape: "row" as TableShape, label: "Ряд", icon: "≡" },
              { shape: "presidium" as TableShape, label: "Президиум", icon: "♛" },
            ]).map(({ shape, label, icon }) => (
              <button
                key={shape}
                onClick={() => addTable(shape)}
                className="flex items-center gap-1 px-2 py-1.5 rounded text-xs"
                style={{
                  background: "#1a160f",
                  border: "1px solid #c9a96e40",
                  color: "var(--cream)",
                }}
              >
                <span style={{ color: "var(--gold)", fontSize: 11 }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>

          {/* Настройки выбранного стола */}
          {selectedTable && (
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <input
                className="px-2 py-1 rounded text-xs flex-1 min-w-0"
                style={{ background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--cream)", outline: "none", minWidth: 80 }}
                value={selectedTable.label}
                onChange={(e) => updateSelected({ label: e.target.value })}
              />
              <div className="flex items-center gap-1">
                <button onClick={() => updateSelected({ seats: Math.max(1, selectedTable.seats - 1) })}
                  className="w-7 h-7 rounded text-sm flex items-center justify-center"
                  style={{ background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--gold)" }}>−</button>
                <span className="text-xs px-1" style={{ color: "var(--cream)", minWidth: 20, textAlign: "center" }}>{selectedTable.seats}</span>
                <button onClick={() => updateSelected({ seats: Math.min(30, selectedTable.seats + 1) })}
                  className="w-7 h-7 rounded text-sm flex items-center justify-center"
                  style={{ background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--gold)" }}>+</button>
              </div>
              <button onClick={deleteSelected}
                className="px-2 py-1 rounded text-xs"
                style={{ background: "#2a0e0e", border: "1px solid #7a2020", color: "#e07070" }}>
                Удалить
              </button>
            </div>
          )}
        </div>

        {/* Список гостей по столам — скроллируемый */}
        <div style={{ flex: 1, overflowY: "auto", background: "#0a0907" }}>
          <div style={{ padding: "8px 12px 4px", borderBottom: "1px solid #c9a96e15" }}>
            <p className="text-xs uppercase tracking-widest" style={{ color: "var(--gold)" }}>
              Гости по столам
            </p>
          </div>
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
      </div>
    </div>
  );
}