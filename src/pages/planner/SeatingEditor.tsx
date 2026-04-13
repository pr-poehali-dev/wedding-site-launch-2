import React, { useRef, useState, useCallback, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { RoundTable, RectTable, OvalTable, generateId, GRID_SIZE, TABLE_COLORS, HallShape, HALL_PRESETS } from "./seating-editor/tableShapes";
import EditorLeftSidebar from "./seating-editor/EditorLeftSidebar";
import EditorRightSidebar from "./seating-editor/EditorRightSidebar";

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
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hallPreset = HALL_PRESETS.find((p) => p.shape === hallShape) ?? HALL_PRESETS[1];
  const HALL_W = hallPreset.w;
  const HALL_H = hallPreset.h;

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
        label: `Стол ${tables.length + 1}`,
        seats: shape === "row" ? 10 : 6,
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
  }, [plan.title, HALL_W, HALL_H]);

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

  const unassignedCount = guests.filter((g) => !g.tableId).length;

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
        {/* Guests button — prominent, near tables */}
        {onOpenGuests && (
          <button
            onClick={onOpenGuests}
            className="flex items-center gap-2 px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-all hover:opacity-90"
            style={{
              background: "var(--gold)",
              color: "var(--velvet)",
              fontWeight: 700,
              boxShadow: "0 0 10px #c9a96e50",
            }}
          >
            <Icon name="Users" size={13} />
            <span>Гости</span>
            {unassignedCount > 0 && (
              <span
                className="flex items-center justify-center w-4 h-4 rounded-full text-xs"
                style={{ background: "#c97070", color: "#fff", fontWeight: 700, fontSize: 10 }}
              >
                {unassignedCount}
              </span>
            )}
          </button>
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
        <EditorLeftSidebar
          selectedTable={selectedTable}
          hallShape={hallShape}
          onAddTable={addTable}
          onUpdateSelected={updateSelected}
          onDeleteSelected={deleteSelected}
          onHallShapeChange={setHallShape}
        />

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

        <EditorRightSidebar
          guests={guests}
          tables={tables}
          guestSearch={guestSearch}
          onGuestSearchChange={setGuestSearch}
          onGuestDragStart={handleGuestDragStart}
          onGuestDragEnd={() => setDraggingGuest(null)}
        />
      </div>
    </div>
  );
}
