import { useRef, useState } from "react";
import Icon from "@/components/ui/icon";
import { GuestItem, TableItem } from "../SeatingEditor";

interface EditorRightSidebarProps {
  guests: GuestItem[];
  tables: TableItem[];
  guestSearch: string;
  onGuestSearchChange: (v: string) => void;
  onGuestDragStart: (guestId: string) => void;
  onGuestDragEnd: () => void;
  onReorderGuests?: (guests: GuestItem[]) => void;
}

interface TableBlock {
  table: TableItem | null; // null = unassigned
  tableId: string | null;
  label: string;
  num: string;
  guests: GuestItem[];
}

function buildBlocks(guests: GuestItem[], tables: TableItem[], search: string): TableBlock[] {
  const q = search.toLowerCase();

  // Sort tables: presidium first, then by label
  const sorted = [...tables].sort((a, b) => {
    if (a.shape === "presidium") return -1;
    if (b.shape === "presidium") return 1;
    return a.label.localeCompare(b.label, "ru");
  });

  const blocks: TableBlock[] = [];

  for (const t of sorted) {
    const tGuests = guests
      .filter((g) => g.tableId === t.id)
      .sort((a, b) => (a.seatIndex ?? 9999) - (b.seatIndex ?? 9999))
      .filter((g) => !q || g.name.toLowerCase().includes(q));
    if (tGuests.length === 0 && q) continue;
    blocks.push({
      table: t,
      tableId: t.id,
      label: t.label,
      num: t.shape === "presidium" ? "№0" : "",
      guests: tGuests,
    });
  }

  // Unassigned
  const unassigned = guests
    .filter((g) => !g.tableId)
    .filter((g) => !q || g.name.toLowerCase().includes(q));
  if (unassigned.length > 0 || !q) {
    blocks.push({
      table: null,
      tableId: null,
      label: "Без стола",
      num: "",
      guests: unassigned,
    });
  }

  return blocks;
}

export default function EditorRightSidebar({
  guests,
  tables,
  guestSearch,
  onGuestSearchChange,
  onGuestDragStart,
  onGuestDragEnd,
  onReorderGuests,
}: EditorRightSidebarProps) {
  const dragGuestRef = useRef<string | null>(null);
  const [dragOverGuestId, setDragOverGuestId] = useState<string | null>(null);
  const [dragOverTableId, setDragOverTableId] = useState<string | null>(null);

  const blocks = buildBlocks(guests, tables, guestSearch);

  // ─── Drag start ────────────────────────────────────────────────────────────
  const handleDragStart = (e: React.DragEvent, guestId: string) => {
    dragGuestRef.current = guestId;
    onGuestDragStart(guestId);
    e.dataTransfer.effectAllowed = "move";
  };

  // ─── Drag over guest (reorder within table) ────────────────────────────────
  const handleDragOverGuest = (e: React.DragEvent, targetGuestId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const srcId = dragGuestRef.current;
    if (!srcId || srcId === targetGuestId) return;
    const src = guests.find((g) => g.id === srcId);
    const tgt = guests.find((g) => g.id === targetGuestId);
    if (!src || !tgt) return;
    // Allow drag over for reorder only within same table; cross-table handled by block
    if (src.tableId !== tgt.tableId) return;
    setDragOverGuestId(targetGuestId);
  };

  // ─── Drop on guest (reorder within table) ─────────────────────────────────
  const handleDropOnGuest = (e: React.DragEvent, targetGuestId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverGuestId(null);
    const srcId = dragGuestRef.current;
    dragGuestRef.current = null;
    if (!srcId || srcId === targetGuestId || !onReorderGuests) return;
    const src = guests.find((g) => g.id === srcId);
    const tgt = guests.find((g) => g.id === targetGuestId);
    if (!src || !tgt || src.tableId !== tgt.tableId || !src.tableId) return;

    const tableGuests = guests
      .filter((g) => g.tableId === src.tableId)
      .sort((a, b) => (a.seatIndex ?? 9999) - (b.seatIndex ?? 9999));

    const srcIdx = tableGuests.findIndex((g) => g.id === srcId);
    const tgtIdx = tableGuests.findIndex((g) => g.id === targetGuestId);
    if (srcIdx === -1 || tgtIdx === -1) return;

    const reordered = [...tableGuests];
    const [moved] = reordered.splice(srcIdx, 1);
    reordered.splice(tgtIdx, 0, moved);

    const withIndex = reordered.map((g, i) => ({ ...g, seatIndex: i }));
    const merged = guests.map((g) => {
      if (g.tableId !== src.tableId) return g;
      return withIndex.find((wg) => wg.id === g.id) ?? g;
    });
    onReorderGuests(merged);
  };

  // ─── Drag over table block (cross-table move) ──────────────────────────────
  const handleDragOverBlock = (e: React.DragEvent, tableId: string | null) => {
    e.preventDefault();
    setDragOverTableId(tableId ?? "__unassigned__");
  };

  const handleDragLeaveBlock = () => {
    setDragOverTableId(null);
  };

  // ─── Drop on table block (move guest to another table) ────────────────────
  const handleDropOnBlock = (e: React.DragEvent, targetTableId: string | null) => {
    e.preventDefault();
    setDragOverTableId(null);
    const srcId = dragGuestRef.current;
    dragGuestRef.current = null;
    if (!srcId || !onReorderGuests) return;
    const src = guests.find((g) => g.id === srcId);
    if (!src) return;
    if (src.tableId === targetTableId) return;

    // Проверяем лимит мест
    if (targetTableId) {
      const targetTable = tables.find((t) => t.id === targetTableId);
      const currentCount = guests.filter((g) => g.tableId === targetTableId && g.id !== srcId).length;
      if (targetTable && currentCount >= targetTable.seats) return; // лимит исчерпан
    }

    const seatsInTarget = guests.filter((g) => g.tableId === targetTableId && g.id !== srcId).length;
    const merged = guests.map((g) =>
      g.id === srcId ? { ...g, tableId: targetTableId, seatIndex: seatsInTarget } : g
    );
    onReorderGuests(merged);
  };

  const handleDragEnd = () => {
    dragGuestRef.current = null;
    setDragOverGuestId(null);
    setDragOverTableId(null);
    onGuestDragEnd();
  };

  return (
    <div
      className="w-full md:w-56 md:flex-shrink-0 flex flex-col md:border-l overflow-y-auto"
      style={{ borderColor: "#c9a96e20", background: "#0d0b08" }}
    >
      {/* Header */}
      <div className="px-3 pt-3 pb-2" style={{ background: "#0d0b08" }}>
        <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "var(--gold)" }}>
          Гости
        </p>
        <input
          className="w-full px-2 py-1 rounded text-xs"
          style={{
            background: "#1a160f",
            border: "1px solid #c9a96e30",
            color: "var(--cream)",
            outline: "none",
          }}
          placeholder="Поиск гостей..."
          value={guestSearch}
          onChange={(e) => onGuestSearchChange(e.target.value)}
        />
      </div>

      {/* Blocks */}
      <div className="flex flex-col gap-0 px-2 pb-3">
        {blocks.map((block) => {
          const blockKey = block.tableId ?? "__unassigned__";
          const isBlockOver = dragOverTableId === blockKey;
          return (
            <div
              key={blockKey}
              onDragOver={(e) => handleDragOverBlock(e, block.tableId)}
              onDragLeave={handleDragLeaveBlock}
              onDrop={(e) => handleDropOnBlock(e, block.tableId)}
              style={{
                marginBottom: 8,
                borderRadius: 6,
                border: isBlockOver ? "1.5px dashed #c9a96e80" : "1px solid #c9a96e15",
                background: isBlockOver ? "#1e1a1060" : "transparent",
                transition: "all 0.1s",
              }}
            >
              {/* Block header */}
              <div
                className="flex items-center gap-1.5 px-2 py-1.5"
                style={{
                  borderBottom: "1px solid #c9a96e20",
                  background: block.table?.shape === "presidium" ? "#1e1508" : "#14110a",
                  borderRadius: "5px 5px 0 0",
                }}
              >
                {block.table?.shape === "presidium" && (
                  <Icon name="Crown" size={10} style={{ color: "#c9a96e", flexShrink: 0 }} />
                )}
                {!block.table && (
                  <Icon name="UserX" size={10} style={{ color: "#c9a96e50", flexShrink: 0 }} />
                )}
                {block.table && block.table.shape !== "presidium" && (
                  <Icon name="Users" size={10} style={{ color: "#c9a96e60", flexShrink: 0 }} />
                )}
                <span
                  className="text-xs font-semibold truncate"
                  style={{
                    color: block.table?.shape === "presidium" ? "#c9a96e" : "var(--cream)",
                    opacity: block.table ? 1 : 0.4,
                  }}
                >
                  {block.num && <span style={{ color: "#c9a96e", marginRight: 4 }}>{block.num}</span>}
                  {block.label}
                </span>
                <span
                  className="ml-auto text-xs"
                  style={{
                    color: block.table && block.guests.length >= block.table.seats ? "#e07070" : "#c9a96e50",
                    flexShrink: 0,
                    fontWeight: block.table && block.guests.length >= block.table.seats ? 700 : 400,
                  }}
                >
                  {block.guests.length}
                  {block.table ? `/${block.table.seats}` : ""}
                  {block.table && block.guests.length >= block.table.seats ? " ●" : ""}
                </span>
              </div>

              {/* Guests in block */}
              <div className="flex flex-col gap-0.5 p-1">
                {block.guests.length === 0 && (
                  <div
                    className="text-xs text-center py-2"
                    style={{ color: "#c9a96e30" }}
                  >
                    {isBlockOver ? "Отпустите для перемещения" : "Пусто"}
                  </div>
                )}
                {block.guests.map((guest, gIdx) => {
                  const isOver = dragOverGuestId === guest.id;
                  const canUp = gIdx > 0 && block.tableId;
                  const canDown = gIdx < block.guests.length - 1 && block.tableId;

                  const moveGuest = (direction: -1 | 1) => {
                    if (!onReorderGuests || !block.tableId) return;
                    const arr = [...block.guests];
                    const swapIdx = gIdx + direction;
                    if (swapIdx < 0 || swapIdx >= arr.length) return;
                    [arr[gIdx], arr[swapIdx]] = [arr[swapIdx], arr[gIdx]];
                    const withIndex = arr.map((g, i) => ({ ...g, seatIndex: i }));
                    const merged = guests.map((g) => {
                      if (g.tableId !== block.tableId) return g;
                      return withIndex.find((wg) => wg.id === g.id) ?? g;
                    });
                    onReorderGuests(merged);
                  };

                  return (
                    <div
                      key={guest.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, guest.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOverGuest(e, guest.id)}
                      onDrop={(e) => handleDropOnGuest(e, guest.id)}
                      className="flex items-center gap-1 px-1.5 py-1 rounded cursor-grab active:cursor-grabbing"
                      style={{
                        background: isOver ? "#2a2318" : "#1a160f",
                        border: `1px solid ${isOver ? "#c9a96e60" : "#c9a96e15"}`,
                        transition: "all 0.1s",
                      }}
                    >
                      {/* Номер места */}
                      {block.table && (
                        <span style={{ color: "#c9a96e80", fontSize: 9, minWidth: 12, textAlign: "right", flexShrink: 0 }}>
                          {gIdx + 1}.
                        </span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate" style={{ color: "var(--cream)", lineHeight: 1.3 }}>
                          {guest.name}
                        </p>
                      </div>
                      {/* Стрелки ↑↓ */}
                      {block.table && (
                        <div className="flex flex-col" style={{ gap: 1, flexShrink: 0 }}>
                          <button
                            onClick={() => moveGuest(-1)}
                            disabled={!canUp}
                            style={{ background: "none", border: "none", cursor: canUp ? "pointer" : "default", color: canUp ? "#c9a96e" : "#c9a96e20", fontSize: 9, padding: "0 2px", lineHeight: 1 }}
                          >▲</button>
                          <button
                            onClick={() => moveGuest(1)}
                            disabled={!canDown}
                            style={{ background: "none", border: "none", cursor: canDown ? "pointer" : "default", color: canDown ? "#c9a96e" : "#c9a96e20", fontSize: 9, padding: "0 2px", lineHeight: 1 }}
                          >▼</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {blocks.length === 0 && (
          <p className="text-xs text-center py-6" style={{ color: "#c9a96e30" }}>
            Нет гостей
          </p>
        )}
      </div>
    </div>
  );
}