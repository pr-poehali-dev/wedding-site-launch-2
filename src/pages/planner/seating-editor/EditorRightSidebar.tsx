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

export default function EditorRightSidebar({
  guests,
  tables,
  guestSearch,
  onGuestSearchChange,
  onGuestDragStart,
  onGuestDragEnd,
  onReorderGuests,
}: EditorRightSidebarProps) {
  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(guestSearch.toLowerCase())
  );
  const seatedGuestIds = new Set(guests.filter((g) => g.tableId).map((g) => g.id));

  // Drag-to-reorder state (only within same table)
  const dragReorderRef = useRef<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleReorderDragStart = (e: React.DragEvent, guestId: string) => {
    dragReorderRef.current = guestId;
    // Also notify parent about guest drag (for table drop)
    onGuestDragStart(guestId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleReorderDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const srcId = dragReorderRef.current;
    if (!srcId || srcId === targetId) return;

    // Only allow reorder within same table
    const src = guests.find((g) => g.id === srcId);
    const tgt = guests.find((g) => g.id === targetId);
    if (!src || !tgt || src.tableId !== tgt.tableId || !src.tableId) return;

    setDragOverId(targetId);
  };

  const handleReorderDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    setDragOverId(null);
    const srcId = dragReorderRef.current;
    dragReorderRef.current = null;
    if (!srcId || srcId === targetId || !onReorderGuests) return;

    const src = guests.find((g) => g.id === srcId);
    const tgt = guests.find((g) => g.id === targetId);
    if (!src || !tgt || src.tableId !== tgt.tableId || !src.tableId) return;

    // Build new order: swap positions within the same tableId group
    const tableGuests = guests.filter((g) => g.tableId === src.tableId);
    const others = guests.filter((g) => g.tableId !== src.tableId);

    const srcIdx = tableGuests.findIndex((g) => g.id === srcId);
    const tgtIdx = tableGuests.findIndex((g) => g.id === targetId);
    if (srcIdx === -1 || tgtIdx === -1) return;

    const reordered = [...tableGuests];
    reordered.splice(srcIdx, 1);
    reordered.splice(tgtIdx, 0, tableGuests[srcIdx]);

    // Assign seatIndex
    const withIndex = reordered.map((g, i) => ({ ...g, seatIndex: i }));

    // Merge back: preserve global order (other guests stay, table guests replaced)
    const merged = guests.map((g) => {
      if (g.tableId !== src.tableId) return g;
      const updated = withIndex.find((wg) => wg.id === g.id);
      return updated ?? g;
    });

    onReorderGuests(merged);
  };

  const handleReorderDragEnd = () => {
    dragReorderRef.current = null;
    setDragOverId(null);
    onGuestDragEnd();
  };

  // Sort guests: for seated ones, sort by seatIndex within each table
  const sortedGuests = [...filteredGuests].sort((a, b) => {
    if (a.tableId && a.tableId === b.tableId) {
      return (a.seatIndex ?? 9999) - (b.seatIndex ?? 9999);
    }
    return 0;
  });

  return (
    <div
      className="w-52 flex-shrink-0 flex flex-col gap-2 p-3 border-l overflow-y-auto"
      style={{ borderColor: "#c9a96e20", background: "#0d0b08" }}
    >
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: "var(--gold)" }}>
        Гости
      </p>

      <input
        className="w-full px-2 py-1 rounded text-xs mb-1"
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

      <div className="flex flex-col gap-1">
        {sortedGuests.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: "#c9a96e50" }}>
            Нет гостей
          </p>
        )}
        {sortedGuests.map((guest) => {
          const assignedTable = tables.find((t) => t.id === guest.tableId);
          const isSeated = seatedGuestIds.has(guest.id);
          const isDropTarget = dragOverId === guest.id;
          return (
            <div
              key={guest.id}
              draggable
              onDragStart={(e) => handleReorderDragStart(e, guest.id)}
              onDragEnd={handleReorderDragEnd}
              onDragOver={(e) => handleReorderDragOver(e, guest.id)}
              onDrop={(e) => handleReorderDrop(e, guest.id)}
              className="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab active:cursor-grabbing transition-all hover:opacity-80"
              style={{
                background: isSeated ? "#1a1d12" : "#1a160f",
                border: `1px solid ${isDropTarget ? "#c9a96e" : isSeated ? "#7ab87a30" : "#c9a96e20"}`,
                outline: isDropTarget ? "1px dashed #c9a96e60" : "none",
                transition: "border 0.1s",
              }}
              title={isSeated ? "Перетащите для смены порядка за столом" : "Перетащите на стол"}
            >
              <Icon name="GripVertical" size={11} style={{ color: "#c9a96e50", flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate" style={{ color: "var(--cream)" }}>
                  {guest.name}
                </p>
                {assignedTable ? (
                  <p className="text-xs truncate" style={{ color: "#7ab87a" }}>
                    {assignedTable.shape === "presidium" ? "№0 " : ""}{assignedTable.label}
                    {guest.seatIndex !== undefined ? ` · место ${guest.seatIndex + 1}` : ""}
                  </p>
                ) : (
                  <p className="text-xs" style={{ color: "#c9a96e50" }}>
                    не размещён
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
