import React, { useRef, useCallback, useEffect } from "react";
import { RoundTable, RectTable, OvalTable, PresidiumTable, GRID_SIZE } from "./tableShapes";
import type { TableItem, GuestItem } from "../SeatingEditor";

interface HallCanvasProps {
  svgRef: React.RefObject<SVGSVGElement>;
  tables: TableItem[];
  guests: GuestItem[];
  hallW: number;
  hallH: number;
  onResizeHall: (w: number, h: number) => void; // оставляем для совместимости
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
  onTouchTableMove,
  onTouchTableEnd,
  onTableTap,
}: HallCanvasProps) {
  // Touch drag state для перемещения столов пальцем
  const touchDragRef = useRef<{
    tableId: string;
    startX: number;
    startY: number;
    tableX: number;
    tableY: number;
  } | null>(null);
  const touchStartTimeRef = useRef<number>(0);

  // ─── SVG coordinate helper ────────────────────────────────────────────────
  const getSvgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (hallW / rect.width),
      y: (clientY - rect.top) * (hallH / rect.height),
    };
  }, [svgRef, hallW, hallH]);

  // ─── Touch на SVG: двигать стол пальцем ──────────────────────────────────
  const handleSvgTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length !== 1) return; // 2 пальца — зум браузера, не трогаем
    const touch = e.touches[0];
    const pt = getSvgPoint(touch.clientX, touch.clientY);
    touchStartTimeRef.current = Date.now();

    for (const table of [...tables].reverse()) {
      const dx = Math.abs(pt.x - table.x);
      const dy = Math.abs(pt.y - table.y);
      if (dx < 60 && dy < 60) {
        touchDragRef.current = {
          tableId: table.id,
          startX: touch.clientX,
          startY: touch.clientY,
          tableX: table.x,
          tableY: table.y,
        };
        e.stopPropagation();
        return;
      }
    }
    // Не попали в стол — позволяем скроллить контейнер
  }, [tables, getSvgPoint]);

  const handleSvgTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchDragRef.current || !onTouchTableMove || e.touches.length !== 1) return;
    e.preventDefault();
    const touch = e.touches[0];
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const scaleX = hallW / rect.width;
    const scaleY = hallH / rect.height;
    const dx = (touch.clientX - touchDragRef.current.startX) * scaleX;
    const dy = (touch.clientY - touchDragRef.current.startY) * scaleY;
    const newX = Math.max(30, Math.min(hallW - 30, touchDragRef.current.tableX + dx));
    const newY = Math.max(30, Math.min(hallH - 30, touchDragRef.current.tableY + dy));
    onTouchTableMove(touchDragRef.current.tableId, newX, newY);
  }, [onTouchTableMove, hallW, hallH, svgRef]);

  const handleSvgTouchEnd = useCallback(() => {
    if (!touchDragRef.current) return;
    const elapsed = Date.now() - touchStartTimeRef.current;
    const tableId = touchDragRef.current.tableId;
    if (elapsed < 250 && onTableTap) onTableTap(tableId);
    touchDragRef.current = null;
    if (onTouchTableEnd) onTouchTableEnd();
  }, [onTableTap, onTouchTableEnd]);

  // Passive:false чтобы preventDefault работал при движении стола
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onMove = (e: TouchEvent) => {
      if (touchDragRef.current) e.preventDefault();
    };
    svg.addEventListener("touchmove", onMove, { passive: false });
    return () => svg.removeEventListener("touchmove", onMove);
  }, [svgRef]);

  // Grid lines
  const gridLines: React.ReactNode[] = [];
  for (let x = 0; x <= hallW; x += GRID_SIZE) {
    gridLines.push(<line key={`vl${x}`} x1={x} y1={0} x2={x} y2={hallH} stroke="#ffffff08" strokeWidth={0.5} />);
  }
  for (let y = 0; y <= hallH; y += GRID_SIZE) {
    gridLines.push(<line key={`hl${y}`} x1={0} y1={y} x2={hallW} y2={y} stroke="#ffffff08" strokeWidth={0.5} />);
  }

  // Inline editor
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
          autoFocus
          value={inlineEditValue}
          onChange={(e) => onInlineEditChange(e.target.value)}
          onBlur={onInlineEditCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onInlineEditCommit();
            if (e.key === "Escape") onInlineEditCancel();
          }}
          style={{ width: iW, height: iH, background: "#1a160f", border: "1.5px solid #c9a96e", borderRadius: 4, color: "#f5edd8", fontSize: 12, fontFamily: "Montserrat, sans-serif", textAlign: "center", outline: "none", padding: "0 6px" }}
        />
      </foreignObject>
    );
  })();

  // SVG рендерится в натуральном размере (hallW × hallH пикселей)
  // Контейнер скроллируется — как карта
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"],
        background: "#0a0908",
      }}
    >
      <div style={{ position: "relative", display: "inline-block", minWidth: "100%" }}>
        <svg
          ref={svgRef}
          width={hallW}
          height={hallH}
          viewBox={`0 0 ${hallW} ${hallH}`}
          style={{
            display: "block",
            cursor: dragging ? "grabbing" : "default",
            borderRadius: 4,
            border: "1px solid #c9a96e20",
            touchAction: "pan-x pan-y", // 1 палец — скролл; 2 пальца — зум браузера
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
                transform={`translate(${table.x}, ${table.y})`}
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
        </svg>
        {/* Подсказка */}
        <div style={{ position: "absolute", bottom: 4, right: 8, fontSize: 9, color: "#c9a96e40", fontFamily: "Montserrat, sans-serif", pointerEvents: "none", userSelect: "none" }}>
          {hallW}×{hallH}
        </div>
      </div>
    </div>
  );
}
