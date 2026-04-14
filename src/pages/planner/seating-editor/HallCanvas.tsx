import React from "react";
import { RoundTable, RectTable, OvalTable, PresidiumTable, GRID_SIZE } from "./tableShapes";
import type { TableItem, GuestItem } from "../SeatingEditor";

interface HallCanvasProps {
  svgRef: React.RefObject<SVGSVGElement>;
  tables: TableItem[];
  guests: GuestItem[];
  hallW: number;
  hallH: number;
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
}: HallCanvasProps) {
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

  return (
    <div className="flex-1 flex items-start justify-center overflow-auto p-4">
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
    </div>
  );
}