import { TableItem, TableShape, GuestItem } from "../SeatingEditor";

export const TABLE_COLORS = [
  { label: "Золото", value: "#c9a96e" },
  { label: "Розовый", value: "#c9788a" },
  { label: "Синий", value: "#6e8fc9" },
  { label: "Зелёный", value: "#7ab87a" },
];

export const GRID_SIZE = 20;
export const HALL_W = 900;
export const HALL_H = 620;

export type HallShape = "square" | "rect-h" | "rect-v";

export interface HallSize {
  shape: HallShape;
  w: number;
  h: number;
}

export const HALL_PRESETS: { shape: HallShape; label: string; w: number; h: number }[] = [
  { shape: "square", label: "Квадратный", w: 400, h: 400 },
  { shape: "rect-h", label: "Горизонтальный", w: 500, h: 300 },
  { shape: "rect-v", label: "Вертикальный", w: 320, h: 480 },
];

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function getTableDimensions(shape: TableShape, seats: number) {
  switch (shape) {
    case "round":
      return { r: Math.max(16, 10 + seats * 2) };
    case "oval":
      return { rx: Math.max(28, 15 + seats * 2), ry: Math.max(16, 9 + seats * 1) };
    case "rect":
      return { w: Math.max(40, 20 + seats * 6), h: 26 };
    case "presidium":
      return { w: Math.max(80, seats * 15), h: 18 };
    default:
      return {};
  }
}

// Truncate name for SVG display
function shortName(name: string, max = 8) {
  if (name.length <= max) return name;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}. ${parts[parts.length - 1]}`;
  return name.slice(0, max);
}

export function RoundTable({
  table,
  selected,
  dragOver,
  guests = [],
}: {
  table: TableItem;
  selected: boolean;
  dragOver: boolean;
  guests?: GuestItem[];
}) {
  const { r } = getTableDimensions("round", table.seats) as { r: number };
  const seatDots: { cx: number; cy: number }[] = [];
  for (let i = 0; i < table.seats; i++) {
    const angle = (2 * Math.PI * i) / table.seats - Math.PI / 2;
    seatDots.push({
      cx: Math.cos(angle) * (r + 5),
      cy: Math.sin(angle) * (r + 5),
    });
  }
  return (
    <>
      <circle
        cx={0}
        cy={0}
        r={r + 6}
        fill="transparent"
        stroke={dragOver ? "#e8d5a3" : "transparent"}
        strokeWidth={dragOver ? 2 : 0}
        strokeDasharray="4 3"
      />
      {seatDots.map((d, i) => {
        const guest = guests[i];
        return (
          <g key={i}>
            <circle cx={d.cx} cy={d.cy} r={guest ? 4 : 3} fill={guest ? "#2a3018" : "#2a2318"} stroke={guest ? "#7ab87a" : table.color} strokeWidth={1} />
            {guest && (
              <text
                x={d.cx}
                y={d.cy + (d.cy > 0 ? 9 : -7)}
                textAnchor="middle"
                fontSize={4}
                fontFamily="Montserrat, sans-serif"
                fill="#c9a96e"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {shortName(guest.name, 7)}
              </text>
            )}
          </g>
        );
      })}
      <circle
        cx={0}
        cy={0}
        r={r}
        fill="#1a160f"
        stroke={selected ? "#c9a96e" : dragOver ? "#e8d5a3" : table.color}
        strokeWidth={selected ? 2 : 1}
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={6}
        fontFamily="Montserrat, sans-serif"
        fill="#f5edd8"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {table.label.slice(0, 8)}
      </text>
    </>
  );
}

export function RectTable({
  table,
  selected,
  dragOver,
  isRow,
  guests = [],
}: {
  table: TableItem;
  selected: boolean;
  dragOver: boolean;
  isRow?: boolean;
  guests?: GuestItem[];
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
        seatsTop.map((sx, i) => {
          const guest = guests[i];
          return (
            <g key={`t${i}`}>
              <circle cx={sx} cy={-h / 2 - 5} r={guest ? 4 : 3} fill={guest ? "#2a3018" : "#2a2318"} stroke={guest ? "#7ab87a" : table.color} strokeWidth={1} />
              {guest && (
                <text x={sx} y={-h / 2 - 12} textAnchor="middle" fontSize={4} fontFamily="Montserrat, sans-serif" fill="#c9a96e" style={{ pointerEvents: "none", userSelect: "none" }}>
                  {shortName(guest.name, 7)}
                </text>
              )}
            </g>
          );
        })}
      {!isRow &&
        seatsBottom.map((sx, i) => {
          const guest = guests[seatsTop.length + i];
          return (
            <g key={`b${i}`}>
              <circle cx={sx} cy={h / 2 + 5} r={guest ? 4 : 3} fill={guest ? "#2a3018" : "#2a2318"} stroke={guest ? "#7ab87a" : table.color} strokeWidth={1} />
              {guest && (
                <text x={sx} y={h / 2 + 12} textAnchor="middle" fontSize={4} fontFamily="Montserrat, sans-serif" fill="#c9a96e" style={{ pointerEvents: "none", userSelect: "none" }}>
                  {shortName(guest.name, 7)}
                </text>
              )}
            </g>
          );
        })}
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={isRow ? 2 : 3}
        fill="#1a160f"
        stroke={selected ? "#c9a96e" : dragOver ? "#e8d5a3" : table.color}
        strokeWidth={selected ? 2 : 1}
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={6}
        fontFamily="Montserrat, sans-serif"
        fill="#f5edd8"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {table.label.slice(0, 10)}
      </text>
    </>
  );
}

export function OvalTable({
  table,
  selected,
  dragOver,
  guests = [],
}: {
  table: TableItem;
  selected: boolean;
  dragOver: boolean;
  guests?: GuestItem[];
}) {
  const { rx, ry } = getTableDimensions("oval", table.seats) as { rx: number; ry: number };
  const seatDots: { cx: number; cy: number }[] = [];
  for (let i = 0; i < table.seats; i++) {
    const angle = (2 * Math.PI * i) / table.seats - Math.PI / 2;
    seatDots.push({
      cx: Math.cos(angle) * (rx + 5),
      cy: Math.sin(angle) * (ry + 5),
    });
  }
  return (
    <>
      {seatDots.map((d, i) => {
        const guest = guests[i];
        return (
          <g key={i}>
            <circle cx={d.cx} cy={d.cy} r={guest ? 4 : 3} fill={guest ? "#2a3018" : "#2a2318"} stroke={guest ? "#7ab87a" : table.color} strokeWidth={1} />
            {guest && (
              <text
                x={d.cx}
                y={d.cy + (d.cy > 0 ? 9 : -7)}
                textAnchor="middle"
                fontSize={4}
                fontFamily="Montserrat, sans-serif"
                fill="#c9a96e"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {shortName(guest.name, 7)}
              </text>
            )}
          </g>
        );
      })}
      <ellipse
        cx={0}
        cy={0}
        rx={rx}
        ry={ry}
        fill="#1a160f"
        stroke={selected ? "#c9a96e" : dragOver ? "#e8d5a3" : table.color}
        strokeWidth={selected ? 2 : 1}
      />
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={6}
        fontFamily="Montserrat, sans-serif"
        fill="#f5edd8"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {table.label.slice(0, 10)}
      </text>
    </>
  );
}

// ── Президиум — одна линия мест СВЕРХУ вдоль длинной стороны
export function PresidiumTable({
  table,
  selected,
  dragOver,
  guests = [],
}: {
  table: TableItem;
  selected: boolean;
  dragOver: boolean;
  guests?: GuestItem[];
}) {
  const { w, h } = getTableDimensions("presidium", table.seats) as { w: number; h: number };
  const seats: number[] = [];
  for (let i = 0; i < table.seats; i++) {
    seats.push((i + 1) * (w / (table.seats + 1)) - w / 2);
  }
  return (
    <>
      {/* Стол */}
      <rect
        x={-w / 2}
        y={-h / 2}
        width={w}
        height={h}
        rx={4}
        fill="#1e1508"
        stroke={selected ? "#c9a96e" : dragOver ? "#e8d5a3" : table.color}
        strokeWidth={selected ? 2.5 : 2}
      />
      {/* Метка ПРЕЗИДИУМ */}
      <text
        x={0}
        y={0}
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize={5}
        fontFamily="Montserrat, sans-serif"
        fill="#c9a96e"
        fontWeight="bold"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {table.label.slice(0, 14)}
      </text>
      {/* Места ТОЛЬКО сверху */}
      {seats.map((sx, i) => {
        const guest = guests[i];
        return (
          <g key={i}>
            {/* Линия от стола к месту */}
            <line
              x1={sx}
              y1={-h / 2}
              x2={sx}
              y2={-h / 2 - 4}
              stroke={table.color}
              strokeWidth={0.5}
              opacity={0.4}
            />
            {/* Место */}
            <circle
              cx={sx}
              cy={-h / 2 - 8}
              r={guest ? 4 : 3}
              fill={guest ? "#1e2a10" : "#2a2318"}
              stroke={guest ? "#7ab87a" : table.color}
              strokeWidth={1}
            />
            {/* Номер места */}
            <text
              x={sx}
              y={-h / 2 - 8}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={3}
              fontFamily="Montserrat, sans-serif"
              fill={guest ? "#7ab87a" : "#c9a96e80"}
              style={{ pointerEvents: "none", userSelect: "none" }}
            >
              {i + 1}
            </text>
            {/* Имя гостя */}
            {guest && (
              <text
                x={sx}
                y={-h / 2 - 15}
                textAnchor="middle"
                fontSize={4}
                fontFamily="Montserrat, sans-serif"
                fill="#e8d5a3"
                style={{ pointerEvents: "none", userSelect: "none" }}
              >
                {shortName(guest.name, 8)}
              </text>
            )}
          </g>
        );
      })}
    </>
  );
}