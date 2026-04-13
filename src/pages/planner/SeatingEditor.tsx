import React, { useRef, useState, useCallback, useEffect } from "react";
import Icon from "@/components/ui/icon";

const PLANS_API = "https://functions.poehali.dev/8192888d-d171-4174-9179-bae0a5946737";
const GUESTS_API = "https://functions.poehali.dev/5a8e58c4-106e-46da-8f0c-84e078f2432c";

export type TableShape = "round" | "rect" | "oval" | "row";

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
  sessionId: string | null;
  planId: string;
}

const TABLE_COLORS = [
  { label: "Золото", value: "#c9a96e" },
  { label: "Розовый", value: "#c9788a" },
  { label: "Синий", value: "#6e8fc9" },
  { label: "Зелёный", value: "#7ab87a" },
];

const GRID_SIZE = 50;
const HALL_W = 900;
const HALL_H = 620;

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function getTableDimensions(shape: TableShape, seats: number) {
  switch (shape) {
    case "round":
      return { r: Math.max(32, 20 + seats * 4) };
    case "oval":
      return { rx: Math.max(55, 30 + seats * 4), ry: Math.max(32, 18 + seats * 2) };
    case "rect":
      return { w: Math.max(80, 40 + seats * 12), h: 52 };
    case "row":
      return { w: Math.max(100, seats * 22), h: 28 };
    default:
      return {};
  }
}

function RoundTable({
  table,
  selected,
  dragOver,
}: {
  table: TableItem;
  selected: boolean;
  dragOver: boolean;
}) {
  const { r } = getTableDimensions("round", table.seats) as { r: number };
  const seatDots: { cx: number; cy: number }[] = [];
  for (let i = 0; i < table.seats; i++) {
    const angle = (2 * Math.PI * i) / table.seats - Math.PI / 2;
    seatDots.push({
      cx: Math.cos(angle) * (r + 10),
      cy: Math.sin(angle) * (r + 10),
    });
  }
  return (
    <>
      <circle
        cx={0}
        cy={0}
        r={r + 12}
        fill="transparent"
        stroke={dragOver ? "#e8d5a3" : "transparent"}
        strokeWidth={dragOver ? 2 : 0}
        strokeDasharray="4 3"
      />
      {seatDots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={5} fill="#2a2318" stroke={table.color} strokeWidth={1.5} />
      ))}
      <circle
        cx={0}
        cy={0}
        r={r}
        fill="#1a160f"
        stroke={selected ? "#c9a96e" : dragOver ? "#e8d5a3" : table.color}
        strokeWidth={selected ? 2.5 : 1.5}
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontFamily="Montserrat, sans-serif"
        fill="#f5edd8"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {table.label.slice(0, 8)}
      </text>
    </>
  );
}

function RectTable({
  table,
  selected,
  dragOver,
  isRow,
}: {
  table: TableItem;
  selected: boolean;
  dragOver: boolean;
  isRow?: boolean;
}) {
  const dims = getTableDimensions(table.shape, table.seats) as { w: number; h: number };
  const { w, h } = dims;
  const seatCount = table.seats;
  const seatsTop: number[] = [];
  const seatsBottom: number[] = [];
  if (!isRow) {
    const perSide = Math.ceil(seatCount / 2);
    for (let i = 0; i < perSide; i++) seatsTop.push((i + 1) * (w / (perSide + 1)) - w / 2);
    for (let i = 0; i < seatCount - perSide; i++)
      seatsBottom.push((i + 1) * (w / (seatCount - perSide + 1)) - w / 2);
  }
  return (
    <>
      {!isRow &&
        seatsTop.map((sx, i) => (
          <circle key={`t${i}`} cx={sx} cy={-h / 2 - 10} r={5} fill="#2a2318" stroke={table.color} strokeWidth={1.5} />
        ))}
      {!isRow &&
        seatsBottom.map((sx, i) => (
          <circle key={`b${i}`} cx={sx} cy={h / 2 + 10} r={5} fill="#2a2318" stroke={table.color} strokeWidth={1.5} />
        ))}
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={isRow ? 3 : 6}
        fill="#1a160f"
        stroke={selected ? "#c9a96e" : dragOver ? "#e8d5a3" : table.color}
        strokeWidth={selected ? 2.5 : 1.5}
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={isRow ? 9 : 11}
        fontFamily="Montserrat, sans-serif"
        fill="#f5edd8"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {table.label.slice(0, isRow ? 12 : 10)}
      </text>
    </>
  );
}

function OvalTable({
  table,
  selected,
  dragOver,
}: {
  table: TableItem;
  selected: boolean;
  dragOver: boolean;
}) {
  const { rx, ry } = getTableDimensions("oval", table.seats) as { rx: number; ry: number };
  const seatDots: { cx: number; cy: number }[] = [];
  for (let i = 0; i < table.seats; i++) {
    const angle = (2 * Math.PI * i) / table.seats - Math.PI / 2;
    seatDots.push({
      cx: Math.cos(angle) * (rx + 10),
      cy: Math.sin(angle) * (ry + 10),
    });
  }
  return (
    <>
      {seatDots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={5} fill="#2a2318" stroke={table.color} strokeWidth={1.5} />
      ))}
      <ellipse
        cx={0}
        cy={0}
        rx={rx}
        ry={ry}
        fill="#1a160f"
        stroke={selected ? "#c9a96e" : dragOver ? "#e8d5a3" : table.color}
        strokeWidth={selected ? 2.5 : 1.5}
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={11}
        fontFamily="Montserrat, sans-serif"
        fill="#f5edd8"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {table.label.slice(0, 10)}
      </text>
    </>
  );
}

export default function SeatingEditor({
  plan,
  tables,
  guests,
  onUpdateTables,
  onSeatGuest,
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
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
    []
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
    [dragging, tables, onUpdateTables, getSvgPoint]
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
        label: `Стол ${tables.length + 1}`,
        seats: shape === "row" ? 10 : 6,
        x: 150 + Math.random() * 500,
        y: 100 + Math.random() * 350,
        color: TABLE_COLORS[0].value,
      };
      const updated = [...tables, newTable];
      onUpdateTables(updated);
      setSelectedId(newTable.id);
      scheduleSave(updated);
    },
    [tables, onUpdateTables, scheduleSave]
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
      setDragOverTableId(null);
      setDraggingGuest(null);
      onSeatGuest(draggingGuest, tableId);
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (sessionId) headers["X-Session-Id"] = sessionId;
        await fetch(GUESTS_API, {
          method: "POST",
          headers,
          body: JSON.stringify({
            action: "update",
            planId,
            guestId: draggingGuest,
            tableId,
          }),
        });
      } catch {
        // silent
      }
    },
    [draggingGuest, onSeatGuest, sessionId, planId]
  );

  const downloadPng = useCallback(async () => {
    const svg = svgRef.current;
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const blob = new Blob([svgStr], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = HALL_W * 2;
      canvas.height = HALL_H * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      const a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.download = `${plan.title || "seating"}.png`;
      a.click();
    };
    img.src = url;
  }, [plan.title]);

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(guestSearch.toLowerCase())
  );

  const seatedGuestIds = new Set(guests.filter((g) => g.tableId).map((g) => g.id));

  // Render grid lines
  const gridLines: React.ReactNode[] = [];
  for (let x = 0; x <= HALL_W; x += GRID_SIZE) {
    gridLines.push(
      <line key={`vl${x}`} x1={x} y1={0} x2={x} y2={HALL_H} stroke="#ffffff08" strokeWidth={0.5} />
    );
  }
  for (let y = 0; y <= HALL_H; y += GRID_SIZE) {
    gridLines.push(
      <line key={`hl${y}`} x1={0} y1={y} x2={HALL_W} y2={y} stroke="#ffffff08" strokeWidth={0.5} />
    );
  }

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  return (
    <div
      className="flex flex-col h-full min-h-screen font-montserrat"
      style={{ background: "var(--velvet)", color: "var(--cream)" }}
    >
      {/* Top Toolbar */}
      <div
        className="flex items-center gap-3 px-4 py-2 border-b"
        style={{ borderColor: "#c9a96e30", background: "#0f0d09" }}
      >
        <span className="text-xs uppercase tracking-widest" style={{ color: "var(--gold)" }}>
          {plan.title}
        </span>
        <div className="flex-1" />
        {saving && (
          <span className="text-xs" style={{ color: "#c9a96e80" }}>
            Сохранение...
          </span>
        )}
        {saved && !saving && (
          <span className="text-xs" style={{ color: "#7ab87a" }}>
            Сохранено
          </span>
        )}
        <button
          onClick={downloadPng}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-all hover:opacity-80"
          style={{ background: "#1e1a12", border: "1px solid #c9a96e50", color: "var(--gold)" }}
        >
          <Icon name="Download" size={13} />
          <span>PNG</span>
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div
          className="w-52 flex-shrink-0 flex flex-col gap-2 p-3 border-r overflow-y-auto"
          style={{ borderColor: "#c9a96e20", background: "#0d0b08" }}
        >
          <p
            className="text-xs uppercase tracking-widest mb-1"
            style={{ color: "var(--gold)" }}
          >
            Добавить стол
          </p>

          {(
            [
              { shape: "round" as TableShape, label: "Круглый", icon: "Circle" },
              { shape: "rect" as TableShape, label: "Прямоугольный", icon: "Square" },
              { shape: "oval" as TableShape, label: "Овальный", icon: "Ellipsis" },
              { shape: "row" as TableShape, label: "Ряд (церемония)", icon: "AlignLeft" },
            ]
          ).map(({ shape, label, icon }) => (
            <button
              key={shape}
              onClick={() => addTable(shape)}
              className="flex items-center gap-2 px-3 py-2 rounded text-left text-xs transition-all hover:opacity-80"
              style={{
                background: "#1a160f",
                border: "1px solid #c9a96e30",
                color: "var(--cream)",
              }}
            >
              <Icon name={icon} size={13} style={{ color: "var(--gold)" }} />
              {label}
            </button>
          ))}

          {selectedTable && (
            <>
              <div className="gold-divider mt-3 mb-2" />
              <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gold)" }}>
                Настройки
              </p>

              <label className="text-xs mb-0.5" style={{ color: "#c9a96e80" }}>
                Название
              </label>
              <input
                className="w-full px-2 py-1 rounded text-xs"
                style={{
                  background: "#1a160f",
                  border: "1px solid #c9a96e30",
                  color: "var(--cream)",
                  outline: "none",
                }}
                value={selectedTable.label}
                onChange={(e) => updateSelected({ label: e.target.value })}
                maxLength={20}
              />

              <label className="text-xs mt-1 mb-0.5" style={{ color: "#c9a96e80" }}>
                Мест
              </label>
              <div className="flex items-center gap-2">
                <button
                  className="w-7 h-7 rounded flex items-center justify-center text-sm transition-all hover:opacity-80"
                  style={{ background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--gold)" }}
                  onClick={() => updateSelected({ seats: Math.max(1, selectedTable.seats - 1) })}
                >
                  −
                </button>
                <span className="text-sm w-6 text-center">{selectedTable.seats}</span>
                <button
                  className="w-7 h-7 rounded flex items-center justify-center text-sm transition-all hover:opacity-80"
                  style={{ background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--gold)" }}
                  onClick={() => updateSelected({ seats: Math.min(30, selectedTable.seats + 1) })}
                >
                  +
                </button>
              </div>

              <label className="text-xs mt-1 mb-1" style={{ color: "#c9a96e80" }}>
                Цвет
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {TABLE_COLORS.map((c) => (
                  <button
                    key={c.value}
                    title={c.label}
                    onClick={() => updateSelected({ color: c.value })}
                    className="w-6 h-6 rounded-full border-2 transition-all"
                    style={{
                      background: c.value,
                      borderColor:
                        selectedTable.color === c.value ? "#f5edd8" : "transparent",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={deleteSelected}
                className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-all hover:opacity-80"
                style={{
                  background: "#2a0e0e",
                  border: "1px solid #7a2020",
                  color: "#e07070",
                }}
              >
                <Icon name="Trash2" size={12} />
                Удалить стол
              </button>
            </>
          )}
        </div>

        {/* Canvas */}
        <div className="flex-1 flex items-start justify-center overflow-auto p-4">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${HALL_W} ${HALL_H}`}
            style={{
              width: "100%",
              maxWidth: HALL_W,
              cursor: dragging ? "grabbing" : "default",
              display: "block",
              borderRadius: 6,
              border: "1px solid #c9a96e20",
            }}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseUp}
            onClick={handleSvgClick}
          >
            {/* Hall background */}
            <rect x={0} y={0} width={HALL_W} height={HALL_H} fill="#110f0a" />
            {/* Grid */}
            {gridLines}
            {/* Hall border */}
            <rect
              x={2}
              y={2}
              width={HALL_W - 4}
              height={HALL_H - 4}
              fill="none"
              stroke="#c9a96e20"
              strokeWidth={1.5}
            />

            {/* Tables */}
            {tables.map((table) => (
              <g
                key={table.id}
                transform={`translate(${table.x}, ${table.y})`}
                onMouseDown={(e) => handleTableMouseDown(e, table.id)}
                onMouseEnter={() => handleTableDragEnter(table.id)}
                onMouseLeave={handleTableDragLeave}
                onMouseUp={() => draggingGuest && handleTableDrop(table.id)}
                style={{ cursor: dragging?.tableId === table.id ? "grabbing" : "grab" }}
              >
                {table.shape === "round" && (
                  <RoundTable
                    table={table}
                    selected={selectedId === table.id}
                    dragOver={dragOverTableId === table.id}
                  />
                )}
                {table.shape === "rect" && (
                  <RectTable
                    table={table}
                    selected={selectedId === table.id}
                    dragOver={dragOverTableId === table.id}
                  />
                )}
                {table.shape === "oval" && (
                  <OvalTable
                    table={table}
                    selected={selectedId === table.id}
                    dragOver={dragOverTableId === table.id}
                  />
                )}
                {table.shape === "row" && (
                  <RectTable
                    table={table}
                    selected={selectedId === table.id}
                    dragOver={dragOverTableId === table.id}
                    isRow
                  />
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Right Sidebar — Guests */}
        <div
          className="w-52 flex-shrink-0 flex flex-col gap-2 p-3 border-l overflow-y-auto"
          style={{ borderColor: "#c9a96e20", background: "#0d0b08" }}
        >
          <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gold)" }}>
            Гости
          </p>

          <input
            className="w-full px-2 py-1 rounded text-xs mb-1"
            style={{
              background: "#1a160f",
              border: "1px solid #c9a96e30",
              color: "var(--cream)",
              outline: "none",
            }}
            placeholder="Поиск гостей..."
            value={guestSearch}
            onChange={(e) => setGuestSearch(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            {filteredGuests.length === 0 && (
              <p className="text-xs text-center py-4" style={{ color: "#c9a96e50" }}>
                Нет гостей
              </p>
            )}
            {filteredGuests.map((guest) => {
              const assignedTable = tables.find((t) => t.id === guest.tableId);
              return (
                <div
                  key={guest.id}
                  draggable
                  onDragStart={() => handleGuestDragStart(guest.id)}
                  onDragEnd={() => setDraggingGuest(null)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab active:cursor-grabbing transition-all hover:opacity-80"
                  style={{
                    background: seatedGuestIds.has(guest.id) ? "#1a1d12" : "#1a160f",
                    border: `1px solid ${seatedGuestIds.has(guest.id) ? "#7ab87a30" : "#c9a96e20"}`,
                  }}
                  title={`Перетащите на стол`}
                >
                  <Icon name="GripVertical" size={11} style={{ color: "#c9a96e50", flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: "var(--cream)" }}>
                      {guest.name}
                    </p>
                    {assignedTable && (
                      <p className="text-xs truncate" style={{ color: "#7ab87a" }}>
                        {assignedTable.label}
                      </p>
                    )}
                    {!assignedTable && (
                      <p className="text-xs" style={{ color: "#c9a96e50" }}>
                        не размещён
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
