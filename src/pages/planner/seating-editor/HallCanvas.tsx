import React, { useRef, useCallback, useEffect, useState } from "react";
import { RoundTable, RectTable, OvalTable, PresidiumTable, GRID_SIZE } from "./tableShapes";
import type { TableItem, GuestItem } from "../SeatingEditor";

interface HallCanvasProps {
  svgRef: React.RefObject<SVGSVGElement>;
  tables: TableItem[];
  guests: GuestItem[];
  hallW: number;
  hallH: number;
  onResizeHall: (w: number, h: number) => void;
  selectedId: string | null;
  dragging: { tableId: string; offsetX: number; offsetY: number } | null;
  dragOverTableId: string | null;
  draggingGuest: string | null;
  inlineEditId: string | null;
  inlineEditValue: string;
  onSvgMouseMove: (e: React.MouseEvent) => void;
  onSvgMouseUp: () => void;
  onSvgClick: (e: React.MouseEvent) => void;
  onTableMouseDown: (e: React.MouseEvent, tableId: string) => void;
  onTableDoubleClick: (e: React.MouseEvent, tableId: string) => void;
  onTableDragEnter: (tableId: string) => void;
  onTableDragLeave: () => void;
  onTableDrop: (tableId: string) => void;
  onInlineEditChange: (value: string) => void;
  onInlineEditCommit: () => void;
  onInlineEditCancel: () => void;
  onTouchTableMove?: (tableId: string, x: number, y: number) => void;
  onTouchTableEnd?: () => void;
  onTableTap?: (tableId: string) => void;
}

const MIN_ZOOM = 0.4;
const MAX_ZOOM = 3;
const GRID = 20; // шаг сетки при ресайзе

export default function HallCanvas({
  svgRef,
  tables,
  guests,
  hallW,
  hallH,
  selectedId,
  dragging,
  dragOverTableId,
  draggingGuest,
  inlineEditId,
  inlineEditValue,
  onSvgMouseMove,
  onSvgMouseUp,
  onSvgClick,
  onTableMouseDown,
  onTableDoubleClick,
  onTableDragEnter,
  onTableDragLeave,
  onTableDrop,
  onInlineEditChange,
  onInlineEditCommit,
  onInlineEditCancel,
  onResizeHall,
  onTouchTableMove,
  onTouchTableEnd,
  onTableTap,
}: HallCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  zoomRef.current = zoom;

  // ─── Resize hall by dragging edge handles ────────────────────────────────
  const resizeRef = useRef<{ type: "right" | "bottom" | "corner"; startX: number; startY: number; startW: number; startH: number } | null>(null);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, type: "right" | "bottom" | "corner") => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { type, startX: e.clientX, startY: e.clientY, startW: hallW, startH: hallH };
    const onMove = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const z = zoomRef.current;
      const dx = (ev.clientX - resizeRef.current.startX) / z;
      const dy = (ev.clientY - resizeRef.current.startY) / z;
      let nW = resizeRef.current.startW;
      let nH = resizeRef.current.startH;
      if (type === "right" || type === "corner") nW = Math.max(GRID * 5, Math.round((resizeRef.current.startW + dx) / GRID) * GRID);
      if (type === "bottom" || type === "corner") nH = Math.max(GRID * 5, Math.round((resizeRef.current.startH + dy) / GRID) * GRID);
      onResizeHall(nW, nH);
    };
    const onUp = () => {
      resizeRef.current = null;
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [hallW, hallH, onResizeHall]);

  const touchResizeRef = useRef<{ type: "right" | "bottom" | "corner"; startX: number; startY: number; startW: number; startH: number } | null>(null);

  const handleResizeTouchStart = useCallback((e: React.TouchEvent, type: "right" | "bottom" | "corner") => {
    e.stopPropagation();
    const t = e.touches[0];
    touchResizeRef.current = { type, startX: t.clientX, startY: t.clientY, startW: hallW, startH: hallH };
  }, [hallW, hallH]);

  const touchDragRef = useRef<{
    tableId: string;
    startX: number; startY: number;
    tableX: number; tableY: number;
  } | null>(null);
  const touchStartTimeRef = useRef<number>(0);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);

  // ─── Ctrl+колесо = зум (десктоп). Обычное колесо = скролл ────────────────
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z * delta)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // ─── Touch: стол / pinch ──────────────────────────────────────────────────
  const handleSvgTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      pinchRef.current = { dist: Math.hypot(dx, dy), zoom: zoomRef.current };
      touchDragRef.current = null;
      return;
    }
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const z = zoomRef.current;
    const ptX = (touch.clientX - rect.left) / z;
    const ptY = (touch.clientY - rect.top) / z;
    touchStartTimeRef.current = Date.now();
    for (const table of [...tables].reverse()) {
      // Президиум широкий — берём реальную зону
      const hitW = table.shape === "presidium" ? Math.max(80, table.seats * 15) / 2 + 10 : 60;
      const hitH = table.shape === "presidium" ? 30 : 60;
      if (Math.abs(ptX - table.x) < hitW && Math.abs(ptY - table.y) < hitH) {
        touchDragRef.current = {
          tableId: table.id,
          startX: touch.clientX, startY: touch.clientY,
          tableX: table.x, tableY: table.y,
        };
        e.stopPropagation();
        return;
      }
    }
  }, [tables, svgRef]);

  const handleSvgTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchRef.current) {
      e.preventDefault();
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;
      const dist = Math.hypot(dx, dy);
      setZoom(Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchRef.current.zoom * (dist / pinchRef.current.dist))));
      return;
    }
    // Тач-ресайз зала
    if (touchResizeRef.current && e.touches.length === 1) {
      e.preventDefault();
      const touch = e.touches[0];
      const z = zoomRef.current;
      const { type, startX, startY, startW, startH } = touchResizeRef.current;
      const dx = (touch.clientX - startX) / z;
      const dy = (touch.clientY - startY) / z;
      let nW = startW;
      let nH = startH;
      if (type === "right" || type === "corner") nW = Math.max(GRID * 5, Math.round((startW + dx) / GRID) * GRID);
      if (type === "bottom" || type === "corner") nH = Math.max(GRID * 5, Math.round((startH + dy) / GRID) * GRID);
      onResizeHall(nW, nH);
      return;
    }
    if (!touchDragRef.current || !onTouchTableMove || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    const z = zoomRef.current;
    const dx = (touch.clientX - touchDragRef.current.startX) / z;
    const dy = (touch.clientY - touchDragRef.current.startY) / z;
    const newX = Math.max(30, Math.min(hallW - 30, touchDragRef.current.tableX + dx));
    const newY = Math.max(30, Math.min(hallH - 30, touchDragRef.current.tableY + dy));
    onTouchTableMove(touchDragRef.current.tableId, newX, newY);
  }, [onTouchTableMove, hallW, hallH]);

  const handleSvgTouchEnd = useCallback((e: React.TouchEvent) => {
    pinchRef.current = null;
    touchResizeRef.current = null;
    if (!touchDragRef.current) return;
    const elapsed = Date.now() - touchStartTimeRef.current;
    const tableId = touchDragRef.current.tableId;
    // Считаем тапом, если прошло < 300мс и почти не двигали
    const touch = e.changedTouches[0];
    const movedX = touch ? Math.abs(touch.clientX - touchDragRef.current.startX) : 0;
    const movedY = touch ? Math.abs(touch.clientY - touchDragRef.current.startY) : 0;
    if (elapsed < 300 && movedX < 10 && movedY < 10 && onTableTap) onTableTap(tableId);
    touchDragRef.current = null;
    if (onTouchTableEnd) onTouchTableEnd();
  }, [onTableTap, onTouchTableEnd]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onMove = (e: TouchEvent) => {
      if (touchDragRef.current || pinchRef.current || touchResizeRef.current) e.preventDefault();
    };
    svg.addEventListener("touchmove", onMove, { passive: false });
    return () => svg.removeEventListener("touchmove", onMove);
  }, [svgRef]);

  // Grid
  const gridLines: React.ReactNode[] = [];
  for (let x = 0; x <= hallW; x += GRID_SIZE) {
    gridLines.push(<line key={`vl${x}`} x1={x} y1={0} x2={x} y2={hallH} stroke="#ffffff08" strokeWidth={0.5} />);
  }
  for (let y = 0; y <= hallH; y += GRID_SIZE) {
    gridLines.push(<line key={`hl${y}`} x1={0} y1={y} x2={hallW} y2={y} stroke="#ffffff08" strokeWidth={0.5} />);
  }

  const inlineEditor = (() => {
    if (!inlineEditId) return null;
    const t = tables.find((tbl) => tbl.id === inlineEditId);
    if (!t) return null;
    const iW = 120; const iH = 26;
    return (
      <foreignObject x={t.x - iW / 2} y={t.y - iH / 2} width={iW} height={iH} style={{ overflow: "visible" }}>
        <input
          // @ts-expect-error xmlns needed for SVG foreignObject
          xmlns="http://www.w3.org/1999/xhtml"
          autoFocus value={inlineEditValue}
          onChange={(e) => onInlineEditChange(e.target.value)}
          onBlur={onInlineEditCommit}
          onKeyDown={(e) => { if (e.key === "Enter") onInlineEditCommit(); if (e.key === "Escape") onInlineEditCancel(); }}
          style={{ width: iW, height: iH, background: "#1a160f", border: "1.5px solid #c9a96e", borderRadius: 4, color: "#f5edd8", fontSize: 12, fontFamily: "Montserrat, sans-serif", textAlign: "center", outline: "none", padding: "0 6px" }}
        />
      </foreignObject>
    );
  })();

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      {/* Скроллируемый контейнер */}
      <div
        ref={containerRef}
        style={{ width: "100%", height: "100%", overflow: "auto", background: "#0a0908" }}
      >
        {/* Зум-обёртка — растягивает пространство прокрутки */}
        <div
          style={{
            width: hallW * zoom,
            height: hallH * zoom,
            position: "relative",
            flexShrink: 0,
          }}
        >
          <svg
            ref={svgRef}
            width={hallW}
            height={hallH}
            viewBox={`0 0 ${hallW} ${hallH}`}
            style={{
              display: "block",
              transformOrigin: "0 0",
              transform: `scale(${zoom})`,
              cursor: dragging ? "grabbing" : "default",
              borderRadius: 4,
              border: "1px solid #c9a96e20",
              touchAction: "none",
            }}
            onMouseMove={onSvgMouseMove}
            onMouseUp={onSvgMouseUp}
            onMouseLeave={onSvgMouseUp}
            onClick={onSvgClick}
            onTouchStart={handleSvgTouchStart}
            onTouchMove={handleSvgTouchMove}
            onTouchEnd={handleSvgTouchEnd}
          >
            <rect x={0} y={0} width={hallW} height={hallH} fill="#110f0a" />
            {gridLines}
            <rect x={2} y={2} width={hallW - 4} height={hallH - 4} fill="none" stroke="#c9a96e20" strokeWidth={1.5} />
            {tables.map((table) => {
              const tableGuests = guests
                .filter((g) => g.tableId === table.id)
                .sort((a, b) => (a.seatIndex ?? 9999) - (b.seatIndex ?? 9999));
              return (
                <g
                  key={table.id}
                  transform={`translate(${table.x}, ${table.y}) scale(${table.scale ?? 1})`}
                  onMouseDown={(e) => onTableMouseDown(e, table.id)}
                  onDoubleClick={(e) => onTableDoubleClick(e, table.id)}
                  onMouseEnter={() => onTableDragEnter(table.id)}
                  onMouseLeave={onTableDragLeave}
                  onMouseUp={() => draggingGuest && onTableDrop(table.id)}
                  onDragOver={(e) => { e.preventDefault(); onTableDragEnter(table.id); }}
                  onDragLeave={onTableDragLeave}
                  onDrop={(e) => { e.preventDefault(); onTableDrop(table.id); }}
                  style={{ cursor: dragging?.tableId === table.id ? "grabbing" : "grab" }}
                >
                  {table.shape === "round" && <RoundTable table={table} selected={selectedId === table.id} dragOver={dragOverTableId === table.id} guests={tableGuests} />}
                  {table.shape === "rect" && <RectTable table={table} selected={selectedId === table.id} dragOver={dragOverTableId === table.id} guests={tableGuests} />}
                  {table.shape === "oval" && <OvalTable table={table} selected={selectedId === table.id} dragOver={dragOverTableId === table.id} guests={tableGuests} />}
                  {table.shape === "presidium" && <PresidiumTable table={table} selected={selectedId === table.id} dragOver={dragOverTableId === table.id} guests={tableGuests} />}
                </g>
              );
            })}
            {inlineEditor}

            {/* ─── Ручки ресайза зала ─────────────────────────────────── */}
            {/* Правый край */}
            <g style={{ cursor: "ew-resize" }}
              onMouseDown={(e) => handleResizeMouseDown(e, "right")}
              onTouchStart={(e) => handleResizeTouchStart(e, "right")}>
              <rect x={hallW - 3} y={0} width={6} height={hallH} fill="transparent" />
              <rect x={hallW - 2} y={hallH / 2 - 20} width={4} height={40} rx={2} fill="#c9a96e" opacity={0.35} />
              <text x={hallW - 10} y={12} textAnchor="end" fontSize={8} fontFamily="Montserrat,sans-serif" fill="#c9a96e60" style={{ pointerEvents: "none", userSelect: "none" }}>
                {Math.round(hallW / GRID)}к
              </text>
            </g>
            {/* Нижний край */}
            <g style={{ cursor: "ns-resize" }}
              onMouseDown={(e) => handleResizeMouseDown(e, "bottom")}
              onTouchStart={(e) => handleResizeTouchStart(e, "bottom")}>
              <rect x={0} y={hallH - 3} width={hallW} height={6} fill="transparent" />
              <rect x={hallW / 2 - 20} y={hallH - 2} width={40} height={4} rx={2} fill="#c9a96e" opacity={0.35} />
              <text x={12} y={hallH - 6} textAnchor="start" fontSize={8} fontFamily="Montserrat,sans-serif" fill="#c9a96e60" style={{ pointerEvents: "none", userSelect: "none" }}>
                {Math.round(hallH / GRID)}к
              </text>
            </g>
            {/* Угол (правый нижний) */}
            <g style={{ cursor: "nwse-resize" }}
              onMouseDown={(e) => handleResizeMouseDown(e, "corner")}
              onTouchStart={(e) => handleResizeTouchStart(e, "corner")}>
              <rect x={hallW - 14} y={hallH - 14} width={14} height={14} fill="transparent" />
              <circle cx={hallW - 5} cy={hallH - 5} r={6} fill="#c9a96e" opacity={0.55} />
            </g>
          </svg>
        </div>
      </div>

      {/* Кнопки зума — поверх контейнера */}
      <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", flexDirection: "column", gap: 4, zIndex: 20 }}>
        <button onClick={() => setZoom((z) => Math.min(MAX_ZOOM, +(z * 1.25).toFixed(2)))}
          style={{ width: 30, height: 30, borderRadius: 6, background: "#1e1a12", border: "1px solid #c9a96e60", color: "var(--gold)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
          title="Увеличить (Ctrl+колесо)">+</button>
        <button onClick={() => setZoom(1)}
          style={{ width: 30, height: 30, borderRadius: 6, background: "#1e1a12", border: "1px solid #c9a96e30", color: "#c9a96e80", fontSize: 9, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Montserrat, sans-serif" }}
          title="Сбросить">1:1</button>
        <button onClick={() => setZoom((z) => Math.max(MIN_ZOOM, +(z * 0.8).toFixed(2)))}
          style={{ width: 30, height: 30, borderRadius: 6, background: "#1e1a12", border: "1px solid #c9a96e60", color: "var(--gold)", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}
          title="Уменьшить">−</button>
      </div>
    </div>
  );
}