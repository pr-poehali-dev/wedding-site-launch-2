export type RsvpStatus = "pending" | "confirmed" | "declined";

export const RSVP_LABELS: Record<RsvpStatus, string> = {
  pending: "Ожидание",
  confirmed: "Придёт",
  declined: "Отказ",
};

export const RSVP_COLORS: Record<RsvpStatus, string> = {
  pending: "#6b7280",
  confirmed: "#7ab87a",
  declined: "#c97070",
};

const GUESTS_API = "https://functions.poehali.dev/5a8e58c4-106e-46da-8f0c-84e078f2432c";

export function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function apiGuests(body: Record<string, unknown>, sessionId: string | null) {
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
