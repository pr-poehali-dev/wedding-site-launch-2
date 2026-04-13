import Icon from "@/components/ui/icon";
import { GuestItem, TableItem } from "../SeatingEditor";

interface EditorRightSidebarProps {
  guests: GuestItem[];
  tables: TableItem[];
  guestSearch: string;
  onGuestSearchChange: (v: string) => void;
  onGuestDragStart: (guestId: string) => void;
  onGuestDragEnd: () => void;
}

export default function EditorRightSidebar({
  guests,
  tables,
  guestSearch,
  onGuestSearchChange,
  onGuestDragStart,
  onGuestDragEnd,
}: EditorRightSidebarProps) {
  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(guestSearch.toLowerCase())
  );
  const seatedGuestIds = new Set(guests.filter((g) => g.tableId).map((g) => g.id));

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
        {filteredGuests.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: "#c9a96e50" }}>
            Нет гостей
          </p>
        )}
        {filteredGuests.map((guest) => {
          const assignedTable = tables.find((t) => t.id === guest.tableId);
          return (
            <div
              key={guest.id}
              draggable
              onDragStart={() => onGuestDragStart(guest.id)}
              onDragEnd={onGuestDragEnd}
              className="flex items-center gap-2 px-2 py-1.5 rounded cursor-grab active:cursor-grabbing transition-all hover:opacity-80"
              style={{
                background: seatedGuestIds.has(guest.id) ? "#1a1d12" : "#1a160f",
                border: `1px solid ${seatedGuestIds.has(guest.id) ? "#7ab87a30" : "#c9a96e20"}`,
              }}
              title="Перетащите на стол"
            >
              <Icon name="GripVertical" size={11} style={{ color: "#c9a96e50", flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate" style={{ color: "var(--cream)" }}>
                  {guest.name}
                </p>
                {assignedTable ? (
                  <p className="text-xs truncate" style={{ color: "#7ab87a" }}>
                    {assignedTable.label}
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