import { useState, useCallback } from "react";
import type { TableItem, GuestItem } from "./SeatingEditor";
import { RsvpStatus, generateId, apiGuests } from "./guest-manager/guestUtils";
import AddGuestForm from "./guest-manager/AddGuestForm";
import GuestRow from "./guest-manager/GuestRow";

interface GuestManagerProps {
  planId: string;
  guests: GuestItem[];
  tables: TableItem[];
  onGuestsChange: (guests: GuestItem[]) => void;
  sessionId: string | null;
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

      <AddGuestForm
        addName={addName}
        addPhone={addPhone}
        addNote={addNote}
        bulkText={bulkText}
        showBulk={showBulk}
        error={error}
        onAddNameChange={setAddName}
        onAddPhoneChange={setAddPhone}
        onAddNoteChange={setAddNote}
        onBulkTextChange={setBulkText}
        onToggleBulk={() => setShowBulk((v) => !v)}
        onAddGuest={addGuest}
        onAddBulk={addBulk}
      />

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

        {guests.map((guest, idx) => (
          <GuestRow
            key={guest.id}
            guest={guest}
            idx={idx}
            tables={tables}
            isEditing={editingId === guest.id}
            isConfirmDelete={confirmDeleteId === guest.id}
            editName={editName}
            editPhone={editPhone}
            editNote={editNote}
            onEditNameChange={setEditName}
            onEditPhoneChange={setEditPhone}
            onEditNoteChange={setEditNote}
            onStartEdit={startEdit}
            onSaveEdit={saveEdit}
            onCancelEdit={cancelEdit}
            onRemove={removeGuest}
            onConfirmDelete={setConfirmDeleteId}
            onCancelDelete={() => setConfirmDeleteId(null)}
            onUpdateRsvp={updateRsvp}
            onUpdateTable={updateTableAssignment}
          />
        ))}
      </div>
    </div>
  );
}
