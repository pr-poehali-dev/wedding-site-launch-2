import { useState, useEffect, useCallback } from "react";

const AUTH_API = "https://functions.poehali.dev/73ade7c7-8c7b-45b3-a620-d27d7a2995fe";
const SESSION_KEY = "planner_session";

export interface PlannerUser {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: PlannerUser | null;
  loading: boolean;
  sessionId: string | null;
}

interface UsePlannerAuthReturn extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

async function callAuth(action: string, body: Record<string, unknown>, sessionId?: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (sessionId) headers["X-Session-Id"] = sessionId;

  const res = await fetch(AUTH_API, {
    method: "POST",
    headers,
    body: JSON.stringify({ action, ...body }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Ошибка сервера" }));
    throw new Error(err.message || "Ошибка запроса");
  }

  return res.json();
}

export function usePlannerAuth(): UsePlannerAuthReturn {
  const [user, setUser] = useState<PlannerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionId, setSessionId] = useState<string | null>(() =>
    localStorage.getItem(SESSION_KEY)
  );

  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }

    callAuth("me", {}, stored)
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setSessionId(stored);
        } else {
          localStorage.removeItem(SESSION_KEY);
          setSessionId(null);
        }
      })
      .catch(() => {
        localStorage.removeItem(SESSION_KEY);
        setSessionId(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await callAuth("login", { email, password });
    if (data.sessionId) {
      localStorage.setItem(SESSION_KEY, data.sessionId);
      setSessionId(data.sessionId);
    }
    if (data.user) {
      setUser(data.user);
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const data = await callAuth("register", { email, password, name });
    if (data.sessionId) {
      localStorage.setItem(SESSION_KEY, data.sessionId);
      setSessionId(data.sessionId);
    }
    if (data.user) {
      setUser(data.user);
    }
  }, []);

  const logout = useCallback(async () => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      await callAuth("logout", {}, stored).catch(() => {});
    }
    localStorage.removeItem(SESSION_KEY);
    setSessionId(null);
    setUser(null);
  }, []);

  return { user, loading, sessionId, login, register, logout };
}
