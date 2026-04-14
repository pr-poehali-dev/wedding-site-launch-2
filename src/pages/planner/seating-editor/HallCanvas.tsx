import React, { useRef, useState, useCallback } from "react";
import { RoundTable, RectTable, OvalTable, PresidiumTable, GRID_SIZE } from "./tableShapes";
import type { TableItem, GuestItem } from "../SeatingEditor";

const MIN_W = 400;
const MIN_H = 300;
const MAX_W = 2000;
const MAX_H = 1600;

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
}

type ResizeEdge = "right" | "bottom" | "corner" | null;

export default function HallCanvas({
  svgRef,
  tables,
  guests,
  hallW,
  hallH,
  onResizeHall,
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
}: HallCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const resizingRef = useRef<ResizeEdge>(null);
  const resizeStartRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const [resizeEdge, setResizeEdge] = useState<ResizeEdge>(null);

  // ─── Resize handlers ───────────────────────────────────────────────────────
  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent, edge: ResizeEdge) => {
      e.preventDefault();
      e.stopPropagation();
      resizingRef.current = edge;
      resizeStartRef.current = { x: e.clientX, y: e.clientY, w: hallW, h: hallH };
      setResizeEdge(edge);

      const onMove = (ev: MouseEvent) => {
        const start = resizeStartRef.current;
        if (!start || !resizingRef.current) return;
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        // SVG is scaled inside container — need to compute SVG-space scale
        const svgEl = svgRef.current;
        let scaleX = 1, scaleY = 1;
        if (svgEl) {
          const rect = svgEl.getBoundingClientRect();
          scaleX = start.w / rect.width;
          scaleY = start.h / rect.height;
        }
        const newW = resizingRef.current !== "bottom"
          ? Math.max(MIN_W, Math.min(MAX_W, start.w + dx * scaleX))
          : start.w;
        const newH = resizingRef.current !== "right"
          ? Math.max(MIN_H, Math.min(MAX_H, start.h + dy * scaleY))
          : start.h;
        onResizeHall(Math.round(newW), Math.round(newH));
      };

      const onUp = () => {
        resizingRef.current = null;
        resizeStartRef.current = null;
        setResizeEdge(null);
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [hallW, hallH, onResizeHall, svgRef]
  );

  // Grid lines
  const gridLines: React.ReactNode[] = [];
  for (let x = 0; x <= hallW; x += GRID_SIZE) {
    gridLines.push(
      <line key={`vl${x}`} x1={x} y1={0} x2={x} y2={hallH} stroke="#ffffff08" strokeWidth={0.5} />
    );
  }
  for (let y = 0; y <= hallH; y += GRID_SIZE) {
    gridLines.push(
      <line key={`hl${y}`} x1={0} y1={y} x2={hallW} y2={y} stroke="#ffffff08" strokeWidth={0.5} />
    );
  }

  // Inline editor overlay
  const inlineEditor = (() => {
    if (!inlineEditId) return null;
    const t = tables.find((tbl) => tbl.id === inlineEditId);
    if (!t) return null;
    const inputW = 120;
    const inputH = 26;
    return (
      <foreignObject
        x={t.x - inputW / 2}
        y={t.y - inputH / 2}
        width={inputW}
        height={inputH}
        style={{ overflow: "visible" }}
      >
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
          style={{
            width: inputW,
            height: inputH,
            background: "#1a160f",
            border: "1.5px solid #c9a96e",
            borderRadius: 4,
            color: "#f5edd8",
            fontSize: 12,
            fontFamily: "Montserrat, sans-serif",
            textAlign: "center",
            outline: "none",
            padding: "0 6px",
          }}
        />
      </foreignObject>
    );
  })();

  const HANDLE = 8; // handle thickness px

  return (
    <div
      ref={containerRef}
      className="flex-1 flex items-start justify-center overflow-auto p-4"
    >
      {/* Wrapper with resize handles */}
      <div style={{ position: "relative", display: "inline-block" }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${hallW} ${hallH}`}
          style={{
            width: "100%",
            maxWidth: hallW,
            cursor: dragging ? "grabbing" : "default",
            display: "block",
            borderRadius: 6,
            border: "1px solid #c9a96e20",
          }}
          onMouseMove={onSvgMouseMove}
          onMouseUp={onSvgMouseUp}
          onMouseLeave={onSvgMouseUp}
          onClick={onSvgClick}
        >
          {/* Hall background */}
          <rect x={0} y={0} width={hallW} height={hallH} fill="#110f0a" />
          {/* Grid */}
          {gridLines}
          {/* Hall border */}
          <rect
            x={2}
            y={2}
            width={hallW - 4}
            height={hallH - 4}
            fill="none"
            stroke="#c9a96e20"
            strokeWidth={1.5}
          />

          {/* Tables */}
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
                {table.shape === "round" && (
                  <RoundTable
                    table={table}
                    selected={selectedId === table.id}
                    dragOver={dragOverTableId === table.id}
                    guests={tableGuests}
                  />
                )}
                {table.shape === "rect" && (
                  <RectTable
                    table={table}
                    selected={selectedId === table.id}
                    dragOver={dragOverTableId === table.id}
                    guests={tableGuests}
                  />
                )}
                {table.shape === "oval" && (
                  <OvalTable
                    table={table}
                    selected={selectedId === table.id}
                    dragOver={dragOverTableId === table.id}
                    guests={tableGuests}
                  />
                )}
                {table.shape === "row" && (
                  <RectTable
                    table={table}
                    selected={selectedId === table.id}
                    dragOver={dragOverTableId === table.id}
                    isRow
                    guests={tableGuests}
                  />
                )}
                {table.shape === "presidium" && (
                  <PresidiumTable
                    table={table}
                    selected={selectedId === table.id}
                    dragOver={dragOverTableId === table.id}
                    guests={tableGuests}
                  />
                )}
              </g>
            );
          })}

          {/* Inline label editor */}
          {inlineEditor}
        </svg>

        {/* ── Resize handle: right edge ── */}
        <div
          onMouseDown={(e) => handleResizeMouseDown(e, "right")}
          title="Изменить ширину зала"
          style={{
            position: "absolute",
            top: "10%",
            right: -6,
            width: HANDLE + 4,
            height: "80%",
            cursor: "ew-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: 4,
              height: "60%",
              minHeight: 32,
              borderRadius: 4,
              background: resizeEdge === "right" || resizeEdge === "corner" ? "#c9a96e" : "#c9a96e50",
              transition: "background 0.15s",
            }}
          />
        </div>

        {/* ── Resize handle: bottom edge ── */}
        <div
          onMouseDown={(e) => handleResizeMouseDown(e, "bottom")}
          title="Изменить высоту зала"
          style={{
            position: "absolute",
            bottom: -6,
            left: "10%",
            height: HANDLE + 4,
            width: "80%",
            cursor: "ns-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
          }}
        >
          <div
            style={{
              height: 4,
              width: "60%",
              minWidth: 32,
              borderRadius: 4,
              background: resizeEdge === "bottom" || resizeEdge === "corner" ? "#c9a96e" : "#c9a96e50",
              transition: "background 0.15s",
            }}
          />
        </div>

        {/* ── Resize handle: corner ── */}
        <div
          onMouseDown={(e) => handleResizeMouseDown(e, "corner")}
          title="Изменить размер зала"
          style={{
            position: "absolute",
            bottom: -6,
            right: -6,
            width: HANDLE + 8,
            height: HANDLE + 8,
            cursor: "nwse-resize",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 11,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: 2,
              background: resizeEdge === "corner" ? "#c9a96e" : "#c9a96e60",
              transition: "background 0.15s",
            }}
          />
        </div>

        {/* Size label */}
        <div
          style={{
            position: "absolute",
            bottom: 6,
            right: 14,
            fontSize: 9,
            color: "#c9a96e40",
            fontFamily: "Montserrat, sans-serif",
            pointerEvents: "none",
            userSelect: "none",
          }}
        >
          {hallW} × {hallH}
        </div>
      </div>
    </div>
  );
}
