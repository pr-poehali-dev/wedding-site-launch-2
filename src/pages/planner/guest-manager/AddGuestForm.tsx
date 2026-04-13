import Icon from "@/components/ui/icon";

interface AddGuestFormProps {
  addName: string;
  addPhone: string;
  addNote: string;
  bulkText: string;
  showBulk: boolean;
  error: string | null;
  onAddNameChange: (v: string) => void;
  onAddPhoneChange: (v: string) => void;
  onAddNoteChange: (v: string) => void;
  onBulkTextChange: (v: string) => void;
  onToggleBulk: () => void;
  onAddGuest: () => void;
  onAddBulk: () => void;
}

export default function AddGuestForm({
  addName,
  addPhone,
  addNote,
  bulkText,
  showBulk,
  error,
  onAddNameChange,
  onAddPhoneChange,
  onAddNoteChange,
  onBulkTextChange,
  onToggleBulk,
  onAddGuest,
  onAddBulk,
}: AddGuestFormProps) {
  return (
    <div
      className="rounded-lg p-4 mb-4"
      style={{ background: "#14110d", border: "1px solid #c9a96e20" }}
    >
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--gold)" }}>
        Добавить гостя
      </p>

      {error && (
        <div
          className="text-xs px-3 py-2 rounded mb-3"
          style={{ background: "#2a0e0e", border: "1px solid #7a2020", color: "#e07070" }}
        >
          {error}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 mb-2">
        <input
          className="flex-1 px-3 py-2 rounded text-sm"
          style={{
            background: "#1a160f",
            border: "1px solid #c9a96e30",
            color: "var(--cream)",
            outline: "none",
          }}
          placeholder="Имя гостя *"
          value={addName}
          onChange={(e) => onAddNameChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onAddGuest()}
        />
        <input
          className="sm:w-44 px-3 py-2 rounded text-sm"
          style={{
            background: "#1a160f",
            border: "1px solid #c9a96e30",
            color: "var(--cream)",
            outline: "none",
          }}
          placeholder="Телефон"
          value={addPhone}
          onChange={(e) => onAddPhoneChange(e.target.value)}
        />
        <input
          className="sm:w-44 px-3 py-2 rounded text-sm"
          style={{
            background: "#1a160f",
            border: "1px solid #c9a96e30",
            color: "var(--cream)",
            outline: "none",
          }}
          placeholder="Заметка"
          value={addNote}
          onChange={(e) => onAddNoteChange(e.target.value)}
        />
        <button
          onClick={onAddGuest}
          className="flex items-center gap-2 px-4 py-2 rounded text-xs uppercase tracking-wider transition-all hover:opacity-80"
          style={{ background: "var(--gold)", color: "var(--velvet)", fontWeight: 600 }}
        >
          <Icon name="UserPlus" size={14} />
          Добавить
        </button>
      </div>

      <button
        onClick={onToggleBulk}
        className="text-xs flex items-center gap-1.5 transition-all hover:opacity-80"
        style={{ color: "#c9a96e80" }}
      >
        <Icon name={showBulk ? "ChevronUp" : "ChevronDown"} size={12} />
        Массовое добавление
      </button>

      {showBulk && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs" style={{ color: "#c9a96e80" }}>
            Вставьте список имён (каждое с новой строки)
          </p>
          <textarea
            className="w-full px-3 py-2 rounded text-sm resize-none"
            style={{
              background: "#1a160f",
              border: "1px solid #c9a96e30",
              color: "var(--cream)",
              outline: "none",
              minHeight: 80,
            }}
            placeholder={"Иван Иванов\nМария Петрова\nАлексей Сидоров"}
            value={bulkText}
            onChange={(e) => onBulkTextChange(e.target.value)}
          />
          <button
            onClick={onAddBulk}
            className="self-start flex items-center gap-2 px-4 py-1.5 rounded text-xs uppercase tracking-wider transition-all hover:opacity-80"
            style={{ background: "#1a160f", border: "1px solid #c9a96e40", color: "var(--gold)" }}
          >
            <Icon name="ListPlus" size={13} />
            Добавить всех
          </button>
        </div>
      )}
    </div>
  );
}
