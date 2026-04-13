import { TableItem, TableShape } from "../SeatingEditor";

export const TABLE_COLORS = [
  { label: "Золото", value: "#c9a96e" },
  { label: "Розовый", value: "#c9788a" },
  { label: "Синий", value: "#6e8fc9" },
  { label: "Зелёный", value: "#7ab87a" },
];

export const GRID_SIZE = 50;
export const HALL_W = 900;
export const HALL_H = 620;

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export function getTableDimensions(shape: TableShape, seats: number) {
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

export function RoundTable({
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

export function RectTable({
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

export function OvalTable({
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
