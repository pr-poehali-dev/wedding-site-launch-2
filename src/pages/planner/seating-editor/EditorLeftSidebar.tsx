import Icon from "@/components/ui/icon";
import { TableItem, TableShape } from "../SeatingEditor";
import { TABLE_COLORS, HallShape, HALL_PRESETS } from "./tableShapes";

interface EditorLeftSidebarProps {
  selectedTable: TableItem | null;
  hallShape: HallShape;
  onAddTable: (shape: TableShape) => void;
  onUpdateSelected: (patch: Partial<TableItem>) => void;
  onDeleteSelected: () => void;
  onHallShapeChange: (shape: HallShape) => void;
}

const HALL_SHAPE_ICONS: Record<HallShape, string> = {
  "square": "Square",
  "rect-h": "RectangleHorizontal",
  "rect-v": "RectangleVertical",
};

export default function EditorLeftSidebar({
  selectedTable,
  hallShape,
  onAddTable,
  onUpdateSelected,
  onDeleteSelected,
  onHallShapeChange,
}: EditorLeftSidebarProps) {
  return (
    <div
      className="w-full md:w-52 md:flex-shrink-0 flex flex-col gap-2 p-3 md:border-r overflow-y-auto"
      style={{ borderColor: "#c9a96e20", background: "#0d0b08" }}
    >
      <div className="gold-divider my-1" />

      {/* Add table */}
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gold)" }}>
        Добавить стол
      </p>

      {(
        [
          { shape: "round" as TableShape, label: "Круглый", icon: "Circle" },
          { shape: "rect" as TableShape, label: "Прямоугольный", icon: "Square" },
          { shape: "oval" as TableShape, label: "Овальный", icon: "Ellipsis" },

          { shape: "presidium" as TableShape, label: "Президиум", icon: "Crown" },
        ]
      ).map(({ shape, label, icon }) => (
        <button
          key={shape}
          onClick={() => onAddTable(shape)}
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
            Настройки стола
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
            onChange={(e) => onUpdateSelected({ label: e.target.value })}
          />

          <label className="text-xs mt-2 mb-0.5" style={{ color: "#c9a96e80" }}>
            Мест
          </label>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdateSelected({ seats: Math.max(1, selectedTable.seats - 1) })}
              className="w-7 h-7 rounded text-sm flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--gold)" }}
            >
              −
            </button>
            <span className="flex-1 text-center text-sm" style={{ color: "var(--cream)" }}>
              {selectedTable.seats}
            </span>
            <button
              onClick={() => onUpdateSelected({ seats: Math.min(30, selectedTable.seats + 1) })}
              className="w-7 h-7 rounded text-sm flex items-center justify-center transition-all hover:opacity-80"
              style={{ background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--gold)" }}
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
                onClick={() => onUpdateSelected({ color: c.value })}
                className="w-6 h-6 rounded-full border-2 transition-all"
                style={{
                  background: c.value,
                  borderColor: selectedTable.color === c.value ? "#f5edd8" : "transparent",
                }}
              />
            ))}
          </div>

          <button
            onClick={onDeleteSelected}
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
  );
}