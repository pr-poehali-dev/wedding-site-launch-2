import React, { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import type { TableItem, GuestItem } from "./SeatingEditor";

const GUESTS_API = "https://functions.poehali.dev/5a8e58c4-106e-46da-8f0c-84e078f2432c";

interface GuestManagerProps {
  planId: string;
  guests: GuestItem[];
  tables: TableItem[];
  onGuestsChange: (guests: GuestItem[]) => void;
  sessionId: string | null;
}

type RsvpStatus = "pending" | "confirmed" | "declined";

const RSVP_LABELS: Record<RsvpStatus, string> = {
  pending: "Ожидание",
  confirmed: "Придёт",
  declined: "Отказ",
};

const RSVP_COLORS: Record<RsvpStatus, string> = {
  pending: "#6b7280",
  confirmed: "#7ab87a",
  declined: "#c97070",
};

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

async function apiGuests(body: Record<string, unknown>, sessionId: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (sessionId) headers["X-Session-Id"] = sessionId;
  const res = await fetch(GUESTS_API, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}

export default function GuestManager({
  planId,
  guests,
  tables,
  onGuestsChange,
  sessionId,
}: GuestManagerProps) {
  const [addName, setAddName] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addNote, setAddNote] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [showBulk, setShowBulk] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editNote, setEditNote] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const total = guests.length;
  const confirmed = guests.filter((g) => g.rsvp === "confirmed").length;
  const unassigned = guests.filter((g) => !g.tableId).length;

  const addGuest = useCallback(async () => {
    if (!addName.trim()) {
      setError("Введите имя гостя");
      return;
    }
    setError(null);
    const newGuest: GuestItem = {
      id: generateId(),
      name: addName.trim(),
      phone: addPhone.trim() || undefined,
      note: addNote.trim() || undefined,
      tableId: null,
      rsvp: "pending",
    };
    const updated = [...guests, newGuest];
    onGuestsChange(updated);
    setAddName("");
    setAddPhone("");
    setAddNote("");

    setSaving(true);
    try {
      await apiGuests({ action: "add", planId, guest: newGuest }, sessionId);
    } catch {
      // silent — optimistic
    } finally {
      setSaving(false);
    }
  }, [addName, addPhone, addNote, guests, onGuestsChange, planId, sessionId]);

  const addBulk = useCallback(async () => {
    const names = bulkText
      .split("\n")
      .map((n) => n.trim())
      .filter(Boolean);
    if (names.length === 0) return;

    const newGuests: GuestItem[] = names.map((name) => ({
      id: generateId(),
      name,
      tableId: null,
      rsvp: "pending",
    }));
    const updated = [...guests, ...newGuests];
    onGuestsChange(updated);
    setBulkText("");
    setShowBulk(false);

    setSaving(true);
    try {
      await apiGuests({ action: "addBulk", planId, guests: newGuests }, sessionId);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }, [bulkText, guests, onGuestsChange, planId, sessionId]);

  const startEdit = useCallback((guest: GuestItem) => {
    setEditingId(guest.id);
    setEditName(guest.name);
    setEditPhone(guest.phone ?? "");
    setEditNote(guest.note ?? "");
  }, []);

  const saveEdit = useCallback(
    async (id: string) => {
      if (!editName.trim()) return;
      const updated = guests.map((g) =>
        g.id === id
          ? { ...g, name: editName.trim(), phone: editPhone.trim() || undefined, note: editNote.trim() || undefined }
          : g
      );
      onGuestsChange(updated);
      setEditingId(null);

      setSaving(true);
      try {
        await apiGuests(
          {
            action: "update",
            planId,
            guestId: id,
            name: editName.trim(),
            phone: editPhone.trim() || undefined,
            note: editNote.trim() || undefined,
          },
          sessionId
        );
      } catch {
        // silent
      } finally {
        setSaving(false);
      }
    },
    [editName, editPhone, editNote, guests, onGuestsChange, planId, sessionId]
  );

  const cancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const removeGuest = useCallback(
    async (id: string) => {
      const updated = guests.filter((g) => g.id !== id);
      onGuestsChange(updated);
      setConfirmDeleteId(null);

      setSaving(true);
      try {
        await apiGuests({ action: "remove", planId, guestId: id }, sessionId);
      } catch {
        // silent
      } finally {
        setSaving(false);
      }
    },
    [guests, onGuestsChange, planId, sessionId]
  );

  const updateRsvp = useCallback(
    async (id: string, rsvp: RsvpStatus) => {
      const updated = guests.map((g) => (g.id === id ? { ...g, rsvp } : g));
      onGuestsChange(updated);

      try {
        await apiGuests({ action: "update", planId, guestId: id, rsvp }, sessionId);
      } catch {
        // silent
      }
    },
    [guests, onGuestsChange, planId, sessionId]
  );

  const updateTableAssignment = useCallback(
    async (id: string, tableId: string) => {
      const updated = guests.map((g) =>
        g.id === id ? { ...g, tableId: tableId || null } : g
      );
      onGuestsChange(updated);

      try {
        await apiGuests(
          { action: "update", planId, guestId: id, tableId: tableId || null },
          sessionId
        );
      } catch {
        // silent
      }
    },
    [guests, onGuestsChange, planId, sessionId]
  );

  return (
    <div
      className="min-h-screen font-montserrat p-6"
      style={{ background: "var(--velvet)", color: "var(--cream)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-cormorant text-2xl font-light" style={{ color: "var(--gold-light)" }}>
            Список гостей
          </h2>
          <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: "#c9a96e80" }}>
            <span>Всего: <span style={{ color: "var(--cream)" }}>{total}</span></span>
            <span>Подтверждено: <span style={{ color: "#7ab87a" }}>{confirmed}</span></span>
            <span>Без стола: <span style={{ color: "#c97070" }}>{unassigned}</span></span>
          </div>
        </div>
        {saving && (
          <span className="text-xs" style={{ color: "#c9a96e60" }}>
            Сохранение...
          </span>
        )}
      </div>

      {/* Add Guest Form */}
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
            onChange={(e) => setAddName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addGuest()}
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
            onChange={(e) => setAddPhone(e.target.value)}
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
            onChange={(e) => setAddNote(e.target.value)}
          />
          <button
            onClick={addGuest}
            className="flex items-center gap-2 px-4 py-2 rounded text-xs uppercase tracking-wider transition-all hover:opacity-80"
            style={{ background: "var(--gold)", color: "var(--velvet)", fontWeight: 600 }}
          >
            <Icon name="UserPlus" size={14} />
            Добавить
          </button>
        </div>

        <button
          onClick={() => setShowBulk((v) => !v)}
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
              onChange={(e) => setBulkText(e.target.value)}
            />
            <button
              onClick={addBulk}
              className="self-start flex items-center gap-2 px-4 py-1.5 rounded text-xs uppercase tracking-wider transition-all hover:opacity-80"
              style={{ background: "#1a160f", border: "1px solid #c9a96e40", color: "var(--gold)" }}
            >
              <Icon name="ListPlus" size={13} />
              Добавить всех
            </button>
          </div>
        )}
      </div>

      {/* Guest Table */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: "1px solid #c9a96e20" }}
      >
        {/* Table Header */}
        <div
          className="grid text-xs uppercase tracking-wider px-4 py-2"
          style={{
            gridTemplateColumns: "2fr 1fr 1fr 1fr 80px",
            background: "#0f0d09",
            color: "var(--gold)",
            borderBottom: "1px solid #c9a96e20",
          }}
        >
          <span>Имя</span>
          <span>Телефон</span>
          <span>Стол</span>
          <span>RSVP</span>
          <span></span>
        </div>

        {guests.length === 0 && (
          <div
            className="py-10 text-center text-sm"
            style={{ background: "#14110d", color: "#c9a96e40" }}
          >
            Пока нет гостей
          </div>
        )}

        {guests.map((guest, idx) => {
          const isEditing = editingId === guest.id;
          const isConfirmDelete = confirmDeleteId === guest.id;

          return (
            <div
              key={guest.id}
              style={{
                background: idx % 2 === 0 ? "#14110d" : "#111009",
                borderBottom: "1px solid #c9a96e10",
              }}
            >
              {isEditing ? (
                <div className="px-4 py-3 flex flex-col gap-2">
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
                      onChange={(e) => setEditName(e.target.value)}
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
                      onChange={(e) => setEditPhone(e.target.value)}
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
                      onChange={(e) => setEditNote(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(guest.id)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-all hover:opacity-80"
                      style={{ background: "var(--gold)", color: "var(--velvet)", fontWeight: 600 }}
                    >
                      <Icon name="Check" size={12} />
                      Сохранить
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="flex items-center gap-1.5 px-3 py-1 rounded text-xs transition-all hover:opacity-80"
                      style={{ background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--cream)" }}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="grid items-center px-4 py-2.5 text-sm"
                  style={{ gridTemplateColumns: "2fr 1fr 1fr 1fr 80px" }}
                >
                  <div className="min-w-0">
                    <p className="truncate" style={{ color: "var(--cream)" }}>
                      {guest.name}
                    </p>
                    {guest.note && (
                      <p className="text-xs truncate mt-0.5" style={{ color: "#c9a96e60" }}>
                        {guest.note}
                      </p>
                    )}
                  </div>
                  <span className="text-xs truncate pr-2" style={{ color: "#c9a96e80" }}>
                    {guest.phone || "—"}
                  </span>

                  {/* Table assignment */}
                  <select
                    className="text-xs rounded px-1.5 py-1 mr-2"
                    style={{
                      background: "#1a160f",
                      border: "1px solid #c9a96e30",
                      color: "var(--cream)",
                      outline: "none",
                    }}
                    value={guest.tableId ?? ""}
                    onChange={(e) => updateTableAssignment(guest.id, e.target.value)}
                  >
                    <option value="">— без стола —</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </select>

                  {/* RSVP */}
                  <select
                    className="text-xs rounded px-1.5 py-1 mr-2"
                    style={{
                      background: "#1a160f",
                      border: `1px solid ${RSVP_COLORS[guest.rsvp ?? "pending"]}40`,
                      color: RSVP_COLORS[guest.rsvp ?? "pending"],
                      outline: "none",
                    }}
                    value={guest.rsvp ?? "pending"}
                    onChange={(e) => updateRsvp(guest.id, e.target.value as RsvpStatus)}
                  >
                    {(Object.keys(RSVP_LABELS) as RsvpStatus[]).map((s) => (
                      <option key={s} value={s} style={{ color: RSVP_COLORS[s] }}>
                        {RSVP_LABELS[s]}
                      </option>
                    ))}
                  </select>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5">
                    {isConfirmDelete ? (
                      <>
                        <button
                          onClick={() => removeGuest(guest.id)}
                          className="px-2 py-1 rounded text-xs transition-all hover:opacity-80"
                          style={{ background: "#2a0e0e", border: "1px solid #7a2020", color: "#e07070" }}
                        >
                          Да
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 rounded text-xs transition-all hover:opacity-80"
                          style={{ background: "#1a160f", border: "1px solid #c9a96e30", color: "var(--cream)" }}
                        >
                          Нет
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => startEdit(guest)}
                          className="w-7 h-7 rounded flex items-center justify-center transition-all hover:opacity-80"
                          style={{ background: "#1a160f", border: "1px solid #c9a96e25" }}
                          title="Редактировать"
                        >
                          <Icon name="Pencil" size={11} style={{ color: "var(--gold)" }} />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(guest.id)}
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
        })}
      </div>
    </div>
  );
}
