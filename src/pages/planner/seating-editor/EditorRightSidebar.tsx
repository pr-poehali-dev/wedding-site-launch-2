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
    if (src.tableId === targetTableId) return; // same table, no-op

    const seatsInTarget = guests.filter(
      (g) => g.tableId === targetTableId && g.id !== srcId
    );
    const nextIndex = seatsInTarget.length;
    const merged = guests.map((g) =>
      g.id === srcId ? { ...g, tableId: targetTableId, seatIndex: nextIndex } : g
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
                  style={{ color: "#c9a96e50", flexShrink: 0 }}
                >
                  {block.guests.length}
                  {block.table ? `/${block.table.seats}` : ""}
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
                {block.guests.map((guest) => {
                  const isOver = dragOverGuestId === guest.id;
                  return (
                    <div
                      key={guest.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, guest.id)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOverGuest(e, guest.id)}
                      onDrop={(e) => handleDropOnGuest(e, guest.id)}
                      className="flex items-center gap-1.5 px-1.5 py-1 rounded cursor-grab active:cursor-grabbing"
                      style={{
                        background: isOver ? "#2a2318" : "#1a160f",
                        border: `1px solid ${isOver ? "#c9a96e60" : "#c9a96e15"}`,
                        transition: "all 0.1s",
                      }}
                      title="Перетащите для смены порядка или переноса на другой стол"
                    >
                      <Icon name="GripVertical" size={10} style={{ color: "#c9a96e40", flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate" style={{ color: "var(--cream)", lineHeight: 1.3 }}>
                          {guest.name}
                        </p>
                        {guest.seatIndex !== undefined && block.table && (
                          <p className="text-xs" style={{ color: "#c9a96e60", fontSize: 9 }}>
                            место {guest.seatIndex + 1}
                          </p>
                        )}
                      </div>
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