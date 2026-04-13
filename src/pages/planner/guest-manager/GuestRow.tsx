import Icon from "@/components/ui/icon";
import type { GuestItem, TableItem } from "../SeatingEditor";
import { RsvpStatus, RSVP_LABELS, RSVP_COLORS } from "./guestUtils";

interface GuestRowProps {
  guest: GuestItem;
  idx: number;
  tables: TableItem[];
  isEditing: boolean;
  isConfirmDelete: boolean;
  editName: string;
  editPhone: string;
  editNote: string;
  onEditNameChange: (v: string) => void;
  onEditPhoneChange: (v: string) => void;
  onEditNoteChange: (v: string) => void;
  onStartEdit: (guest: GuestItem) => void;
  onSaveEdit: (id: string) => void;
  onCancelEdit: () => void;
  onRemove: (id: string) => void;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
  onUpdateRsvp: (id: string, rsvp: RsvpStatus) => void;
  onUpdateTable: (id: string, tableId: string) => void;
}

export default function GuestRow({
  guest,
  idx,
  tables,
  isEditing,
  isConfirmDelete,
  editName,
  editPhone,
  editNote,
  onEditNameChange,
  onEditPhoneChange,
  onEditNoteChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
  onConfirmDelete,
  onCancelDelete,
  onUpdateRsvp,
  onUpdateTable,
}: GuestRowProps) {
  const num = idx + 1;
  const assignedTable = tables.find((t) => t.id === guest.tableId);

  return (
    <div
      style={{
        background: idx % 2 === 0 ? "#14110d" : "#111009",
        borderBottom: "1px solid #c9a96e10",
      }}
    >
      {isEditing ? (
        <div className="px-4 py-3 flex flex-col gap-2">
          {/* номер при редактировании */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold w-6 text-right flex-shrink-0" style={{ color: "#c9a96e60" }}>
              {num}
            </span>
            <span className="text-xs" style={{ color: "#c9a96e60" }}>Редактирование</span>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              className="flex-1 min-w-0 px-2 py-1.5 rounded text-sm"
              style={{
                background: "#1a160f",
                border: "1px solid #c9a96e40",
                color: "var(--cream)",
                outline: "none",
              }}
              placeholder="Имя"
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
            />
            <input
              className="w-36 px-2 py-1.5 rounded text-sm"
              style={{
                background: "#1a160f",
                border: "1px solid #c9a96e40",
                color: "var(--cream)",
                outline: "none",
              }}
              placeholder="Телефон"
              value={editPhone}
              onChange={(e) => onEditPhoneChange(e.target.value)}
            />
            <input
              className="w-40 px-2 py-1.5 rounded text-sm"
              style={{
                background: "#1a160f",
                border: "1px solid #c9a96e40",
                color: "var(--cream)",
                outline: "none",
              }}
              placeholder="Заметка"
              value={editNote}
              onChange={(e) => onEditNoteChange(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onSaveEdit(guest.id)}
              className="flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-all hover:opacity-80"
              style={{ background: "var(--gold)", color: "var(--velvet)", fontWeight: 600 }}
            >
              <Icon name="Check" size={12} />
              Сохранить
            </button>
            <button
              onClick={onCancelEdit}
              className="flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-all hover:opacity-80"
              style={{ background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--cream)" }}
            >
              Отмена
            </button>
          </div>
        </div>
      ) : (
        <div
          className="grid items-center px-3 py-2.5 text-sm"
          style={{ gridTemplateColumns: "32px 2fr 1fr 1fr 1fr 80px" }}
        >
          {/* Номер */}
          <span
            className="text-xs font-bold text-right pr-2 select-none"
            style={{ color: "#c9a96e50" }}
          >
            {num}
          </span>

          {/* Имя */}
          <div className="min-w-0 pr-2">
            <p className="truncate" style={{ color: "var(--cream)" }}>
              {guest.name}
            </p>
            {guest.note && (
              <p className="text-xs truncate mt-0.5" style={{ color: "#c9a96e60" }}>
                {guest.note}
              </p>
            )}
          </div>

          {/* Телефон */}
          <span className="text-xs truncate pr-2" style={{ color: "#c9a96e80" }}>
            {guest.phone || "—"}
          </span>

          {/* Стол */}
          <div className="pr-2">
            <select
              className="w-full text-xs rounded px-1.5 py-1"
              style={{
                background: "#1a160f",
                border: `1px solid ${assignedTable ? assignedTable.color + "60" : "#c9a96e30"}`,
                color: assignedTable ? "var(--cream)" : "#c9a96e50",
                outline: "none",
              }}
              value={guest.tableId ?? ""}
              onChange={(e) => onUpdateTable(guest.id, e.target.value)}
            >
              <option value="">— без стола —</option>
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* RSVP */}
          <div className="pr-2">
            <select
              className="w-full text-xs rounded px-1.5 py-1"
              style={{
                background: "#1a160f",
                border: `1px solid ${RSVP_COLORS[guest.rsvp ?? "pending"]}40`,
                color: RSVP_COLORS[guest.rsvp ?? "pending"],
                outline: "none",
              }}
              value={guest.rsvp ?? "pending"}
              onChange={(e) => onUpdateRsvp(guest.id, e.target.value as RsvpStatus)}
            >
              {(Object.keys(RSVP_LABELS) as RsvpStatus[]).map((s) => (
                <option key={s} value={s} style={{ color: RSVP_COLORS[s] }}>
                  {RSVP_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {isConfirmDelete ? (
              <>
                <button
                  onClick={() => onRemove(guest.id)}
                  className="px-2 py-1 rounded text-xs transition-all hover:opacity-80"
                  style={{ background: "#2a0e0e", border: "1px solid #7a2020", color: "#e07070" }}
                >
                  Да
                </button>
                <button
                  onClick={onCancelDelete}
                  className="px-2 py-1 rounded text-xs transition-all hover:opacity-80"
                  style={{ background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--cream)" }}
                >
                  Нет
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => onStartEdit(guest)}
                  className="w-7 h-7 rounded flex items-center justify-center transition-all hover:opacity-80"
                  style={{ background: "#1a160f", border: "1px solid #c9a96e25" }}
                  title="Редактировать"
                >
                  <Icon name="Pencil" size={11} style={{ color: "var(--gold)" }} />
                </button>
                <button
                  onClick={() => onConfirmDelete(guest.id)}
                  className="w-7 h-7 rounded flex items-center justify-center transition-all hover:opacity-80"
                  style={{ background: "#1a160f", border: "1px solid #7a202020" }}
                  title="Удалить"
                >
                  <Icon name="Trash2" size={11} style={{ color: "#c97070" }} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}