import Icon from "@/components/ui/icon";

interface EditorToolbarProps {
  planTitle: string;
  saving: boolean;
  saved: boolean;
  unassignedCount: number;
  onOpenGuests?: () => void;
  onDownloadPng: () => void;
}

export default function EditorToolbar({
  planTitle,
  saving,
  saved,
  unassignedCount,
  onOpenGuests,
  onDownloadPng,
}: EditorToolbarProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2 border-b"
      style={{ borderColor: "#c9a96e30", background: "#0f0d09" }}
    >
      <span className="text-xs uppercase tracking-widest" style={{ color: "var(--gold)" }}>
        {planTitle}
      </span>
      <div className="flex-1" />
      {saving && (
        <span className="text-xs" style={{ color: "#c9a96e80" }}>
          Сохранение...
        </span>
      )}
      {saved && !saving && (
        <span className="text-xs" style={{ color: "#7ab87a" }}>
          Сохранено
        </span>
      )}
      {onOpenGuests && (
        <button
          onClick={onOpenGuests}
          className="flex items-center gap-2 px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-all hover:opacity-90"
          style={{
            background: "var(--gold)",
            color: "var(--velvet)",
            fontWeight: 700,
            boxShadow: "0 0 10px #c9a96e50",
          }}
        >
          <Icon name="Users" size={13} />
          <span>Гости</span>
          {unassignedCount > 0 && (
            <span
              className="flex items-center justify-center w-4 h-4 rounded-full text-xs"
              style={{ background: "#c97070", color: "#fff", fontWeight: 700, fontSize: 10 }}
            >
              {unassignedCount}
            </span>
          )}
        </button>
      )}
      <button
        onClick={onDownloadPng}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs uppercase tracking-wider transition-all hover:opacity-80"
        style={{ background: "#1e1a12", border: "1px solid #c9a96e50", color: "var(--gold)" }}
      >
        <Icon name="Download" size={13} />
        <span>PNG</span>
      </button>
    </div>
  );
}
