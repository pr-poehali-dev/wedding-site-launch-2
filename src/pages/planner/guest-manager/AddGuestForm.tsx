import { useState, useRef, useCallback } from "react";
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

// Parsed guest before bulk-add: name + optional phone
interface ParsedGuest {
  id: string;
  name: string;
  phone: string;
}

function parseGuestList(text: string): ParsedGuest[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      // Try to detect phone: sequence of 7+ digits possibly with +, -, spaces
      const phoneMatch = line.match(/(\+?[\d][\d\s\-().]{6,})/);
      let name = line;
      let phone = "";
      if (phoneMatch) {
        phone = phoneMatch[0].trim();
        name = line.replace(phoneMatch[0], "").replace(/[,;:]+$/, "").trim();
      }
      return { id: String(i), name: name || line, phone };
    });
}

// SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
}
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}
interface SpeechRecognitionInstance extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  onresult: ((e: SpeechRecognitionEvent) => void) | null;
  onerror: ((e: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
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
  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Parsed bulk preview for editing before adding
  const [parsedGuests, setParsedGuests] = useState<ParsedGuest[] | null>(null);

  const voiceSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const startVoice = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setVoiceError("Голосовой ввод работает только в браузере Chrome или Edge");
      return;
    }
    setVoiceError(null);
    const rec = new SR();
    rec.lang = "ru-RU";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      onAddNameChange(addName ? addName + " " + transcript : transcript);
    };
    rec.onerror = (e: SpeechRecognitionErrorEvent) => {
      if (e.error === "not-allowed") {
        setVoiceError("Нет доступа к микрофону — разрешите его в настройках браузера");
      } else if (e.error === "no-speech") {
        setVoiceError("Ничего не услышано, попробуйте ещё раз");
      } else if (e.error === "network") {
        setVoiceError("Ошибка сети — проверьте интернет-соединение");
      } else {
        setVoiceError("Ошибка распознавания: " + e.error);
      }
      setIsListening(false);
    };
    rec.onend = () => setIsListening(false);
    recognitionRef.current = rec;
    try {
      rec.start();
      setIsListening(true);
    } catch {
      setVoiceError("Не удалось запустить микрофон — попробуйте ещё раз");
    }
  }, [addName, onAddNameChange]);

  const stopVoice = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleFileImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        // Strip HTML tags if .doc/.docx opened as text (basic fallback)
        const clean = text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        // Split by common separators: newlines, semicolons, commas (if no digits nearby)
        const lines = clean
          .split(/[\n;]/)
          .map((s) => s.trim())
          .filter((s) => s.length > 1)
          .join("\n");
        onBulkTextChange(lines);
        if (!showBulk) onToggleBulk();
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [onBulkTextChange, showBulk, onToggleBulk]
  );

  const handlePreviewBulk = useCallback(() => {
    const parsed = parseGuestList(bulkText);
    if (parsed.length > 0) setParsedGuests(parsed);
  }, [bulkText]);

  const updateParsed = useCallback((id: string, field: "name" | "phone", value: string) => {
    setParsedGuests((prev) =>
      prev ? prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)) : prev
    );
  }, []);

  const confirmParsed = useCallback(() => {
    if (!parsedGuests) return;
    const lines = parsedGuests
      .filter((g) => g.name.trim())
      .map((g) => (g.phone ? `${g.name} ${g.phone}` : g.name))
      .join("\n");
    onBulkTextChange(lines);
    setParsedGuests(null);
    onAddBulk();
  }, [parsedGuests, onBulkTextChange, onAddBulk]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="rounded-lg p-4 mb-4"
      style={{ background: "#14110d", border: "1px solid #c9a96e20" }}
    >
      <p className="text-xs uppercase tracking-widest mb-3" style={{ color: "var(--gold)" }}>
        Добавить гостя
      </p>

      {(error || voiceError) && (
        <div
          className="text-xs px-3 py-2 rounded mb-3"
          style={{ background: "#2a0e0e", border: "1px solid #7a2020", color: "#e07070" }}
        >
          {error || voiceError}
        </div>
      )}

      {/* Single guest row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:gap-2 mb-2">
        <div className="flex flex-1 gap-1.5">
          <input
            className="flex-1 min-w-0 px-3 py-2 rounded text-sm"
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
          {/* Voice button — only Chrome/Edge */}
          {voiceSupported ? (
            <button
              type="button"
              onClick={isListening ? stopVoice : startVoice}
              title={isListening ? "Остановить запись" : "Надиктовать имя (Chrome/Edge)"}
              className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded transition-all hover:opacity-80"
              style={{
                background: isListening ? "#3a1a0a" : "#1a160f",
                border: `1px solid ${isListening ? "#c97040" : "#c9a96e30"}`,
                color: isListening ? "#e09060" : "#c9a96e80",
              }}
            >
              <Icon name={isListening ? "MicOff" : "Mic"} size={14} />
            </button>
          ) : (
            <button
              type="button"
              disabled
              title="Голосовой ввод доступен только в Chrome и Edge"
              className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded"
              style={{
                background: "#1a160f",
                border: "1px solid #c9a96e15",
                color: "#c9a96e30",
                cursor: "not-allowed",
              }}
            >
              <Icon name="MicOff" size={14} />
            </button>
          )}
        </div>
        <input
          className="sm:w-40 px-3 py-2 rounded text-sm"
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
          className="sm:w-36 px-3 py-2 rounded text-sm"
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

      {isListening && (
        <p className="text-xs mb-2 flex items-center gap-1.5" style={{ color: "#e09060" }}>
          <span className="inline-block w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          Говорите имя...
        </p>
      )}

      {/* Bulk / import toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleBulk}
          className="text-xs flex items-center gap-1.5 transition-all hover:opacity-80"
          style={{ color: "#c9a96e80" }}
        >
          <Icon name={showBulk ? "ChevronUp" : "ChevronDown"} size={12} />
          Массовое добавление
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-xs flex items-center gap-1.5 transition-all hover:opacity-80"
          style={{ color: "#c9a96e80" }}
        >
          <Icon name="FileUp" size={12} />
          Загрузить из файла
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.doc,.docx,.csv"
          className="hidden"
          onChange={handleFileImport}
        />
      </div>

      {showBulk && !parsedGuests && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs" style={{ color: "#c9a96e80" }}>
            Вставьте список имён (каждое с новой строки). Можно сразу указать телефон через пробел.
          </p>
          <textarea
            className="w-full px-3 py-2 rounded text-sm resize-none"
            style={{
              background: "#1a160f",
              border: "1px solid #c9a96e30",
              color: "var(--cream)",
              outline: "none",
              minHeight: 90,
            }}
            placeholder={"Иван Иванов +79001234567\nМария Петрова\nАлексей Сидоров"}
            value={bulkText}
            onChange={(e) => onBulkTextChange(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handlePreviewBulk}
              className="self-start flex items-center gap-2 px-4 py-1.5 rounded text-xs uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: "var(--gold)", color: "var(--velvet)", fontWeight: 600 }}
            >
              <Icon name="Eye" size={13} />
              Проверить и добавить
            </button>
            <button
              onClick={onAddBulk}
              className="self-start flex items-center gap-2 px-4 py-1.5 rounded text-xs uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: "#1a160f", border: "1px solid #c9a96e40", color: "var(--gold)" }}
            >
              <Icon name="ListPlus" size={13} />
              Добавить сразу
            </button>
          </div>
        </div>
      )}

      {/* Parsed preview for editing */}
      {parsedGuests && (
        <div className="mt-3 flex flex-col gap-2">
          <p className="text-xs mb-1" style={{ color: "#c9a96e80" }}>
            Проверьте имена и номера перед добавлением:
          </p>
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto pr-1">
            {parsedGuests.map((g) => (
              <div key={g.id} className="flex gap-2">
                <input
                  className="flex-1 px-2 py-1 rounded text-xs"
                  style={{
                    background: "#1a160f",
                    border: "1px solid #c9a96e30",
                    color: "var(--cream)",
                    outline: "none",
                  }}
                  value={g.name}
                  onChange={(e) => updateParsed(g.id, "name", e.target.value)}
                  placeholder="Имя"
                />
                <input
                  className="w-36 px-2 py-1 rounded text-xs"
                  style={{
                    background: "#1a160f",
                    border: "1px solid #c9a96e30",
                    color: "var(--cream)",
                    outline: "none",
                  }}
                  value={g.phone}
                  onChange={(e) => updateParsed(g.id, "phone", e.target.value)}
                  placeholder="Телефон"
                />
                <button
                  onClick={() => setParsedGuests((prev) => prev ? prev.filter((x) => x.id !== g.id) : prev)}
                  className="w-7 h-7 flex items-center justify-center rounded transition-all hover:opacity-80"
                  style={{ background: "#2a0e0e", border: "1px solid #7a202030", color: "#e07070", flexShrink: 0 }}
                >
                  <Icon name="X" size={11} />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <button
              onClick={confirmParsed}
              className="flex items-center gap-2 px-4 py-1.5 rounded text-xs uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: "var(--gold)", color: "var(--velvet)", fontWeight: 600 }}
            >
              <Icon name="Check" size={13} />
              Добавить {parsedGuests.length} гостей
            </button>
            <button
              onClick={() => setParsedGuests(null)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition-all hover:opacity-80"
              style={{ background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--cream)" }}
            >
              Назад
            </button>
          </div>
        </div>
      )}
    </div>
  );
}