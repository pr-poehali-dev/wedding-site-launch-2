import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { usePlannerAuth } from "@/hooks/usePlannerAuth";
import SeatingEditor, { TableItem, GuestItem } from "./planner/SeatingEditor";
import GuestManager from "./planner/GuestManager";

const PLANS_API = "https://functions.poehali.dev/8192888d-d171-4174-9179-bae0a5946737";

type View = "landing" | "editor" | "guests";

interface Plan {
  id: string;
  title: string;
  event_date?: string;
  hall_width?: number;
  hall_height?: number;
  guest_token?: string;
  updated_at?: string;
}

type AuthTab = "login" | "register";

export default function PlannerPage() {
  const { user, loading, sessionId, login, register, logout } = usePlannerAuth();
  const [view, setView] = useState<View>("landing");
  const [plans, setPlans] = useState<Plan[]>([]);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [guests, setGuests] = useState<GuestItem[]>([]);
  const [planTitle, setPlanTitle] = useState("");

  const [showAuth, setShowAuth] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const titleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Загружаем список планов пользователя
  useEffect(() => {
    if (!user || !sessionId) return;
    fetch(PLANS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Session-Id": sessionId },
      body: JSON.stringify({ action: "list" }),
    })
      .then(r => r.json())
      .then(d => { if (d.plans) setPlans(d.plans); })
      .catch(() => {});
  }, [user, sessionId]);

  const callApi = (body: object) =>
    fetch(PLANS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(sessionId ? { "X-Session-Id": sessionId } : {}) },
      body: JSON.stringify(body),
    }).then(r => r.json());

  const openPlan = async (plan: Plan) => {
    const data = await callApi({ action: "get", plan_id: plan.id });
    setActivePlan(data);
    setPlanTitle(data.title || "Мой план рассадки");
    setTables((data.tables || []).map((t: Record<string, unknown>) => ({ ...t, id: String(t.id) })));
    setGuests((data.guests || []).map((g: Record<string, unknown>) => ({ ...g, id: String(g.id), tableId: g.table_id ? String(g.table_id) : null })));
    setView("editor");
  };

  const createPlan = async () => {
    const data = await callApi({ action: "create", title: "Мой план рассадки" });
    const newPlan: Plan = { id: String(data.id), title: "Мой план рассадки", guest_token: data.guest_token };
    setActivePlan(newPlan);
    setPlanTitle("Мой план рассадки");
    setTables([]);
    setGuests([]);
    setView("editor");
    if (user) setPlans(p => [newPlan, ...p]);
  };

  const deletePlan = async (planId: string) => {
    if (!confirm("Удалить этот план?")) return;
    await callApi({ action: "update", plan_id: planId, title: "DELETED" });
    setPlans(p => p.filter(x => x.id !== planId));
  };

  const handleTitleChange = (val: string) => {
    setPlanTitle(val);
    if (titleTimer.current) clearTimeout(titleTimer.current);
    titleTimer.current = setTimeout(() => {
      if (activePlan) callApi({ action: "update", plan_id: activePlan.id, title: val }).catch(() => {});
    }, 1000);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthLoading(true);
    try {
      if (authTab === "login") {
        await login(authEmail, authPassword);
      } else {
        await register(authEmail, authPassword, authName);
      }
      setShowAuth(false);
      setAuthEmail(""); setAuthPassword(""); setAuthName("");
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Ошибка");
    } finally {
      setAuthLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--velvet)" }}>
        <div className="font-montserrat text-xs tracking-widest uppercase" style={{ color: "rgba(201,169,110,0.5)" }}>Загрузка…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--velvet)" }}>
      {/* Шапка */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: "1px solid rgba(201,169,110,0.15)" }}>
        <a href="/" className="font-cormorant text-xl tracking-widest" style={{ color: "var(--gold)" }}>
          La Belle Époque
        </a>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.5)" }}>{user.name}</span>
              <button onClick={logout} className="font-montserrat text-xs tracking-widest uppercase px-3 py-1.5 transition-all"
                style={{ border: "1px solid rgba(201,169,110,0.3)", color: "rgba(245,237,216,0.5)" }}>
                Выйти
              </button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} className="font-montserrat text-xs tracking-widest uppercase px-4 py-2 transition-all"
              style={{ border: "1px solid var(--gold)", color: "var(--gold)" }}>
              Войти
            </button>
          )}
        </div>
      </div>

      {/* Редактор */}
      {view === "editor" && activePlan && (
        <div className="flex flex-col" style={{ minHeight: "calc(100vh - 65px)" }}>
          <div className="flex items-center gap-4 px-6 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(201,169,110,0.1)", background: "rgba(201,169,110,0.03)" }}>
            <button onClick={() => setView("landing")} className="flex items-center gap-1 font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.4)" }}>
              <Icon name="ChevronLeft" size={14} /> Назад
            </button>
            <input value={planTitle} onChange={e => handleTitleChange(e.target.value)}
              className="bg-transparent outline-none font-cormorant text-lg flex-1 min-w-0"
              style={{ color: "var(--cream)", borderBottom: "1px solid rgba(201,169,110,0.2)" }} />
            <button onClick={() => setView("guests")} className="flex items-center gap-2 font-montserrat text-xs tracking-widest uppercase px-4 py-2 transition-all"
              style={{ border: "1px solid rgba(201,169,110,0.3)", color: "rgba(245,237,216,0.6)" }}>
              <Icon name="Users" size={13} />
              Гости ({guests.length})
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SeatingEditor
              plan={{ id: String(activePlan.id), title: planTitle }}
              tables={tables}
              guests={guests}
              onUpdateTables={setTables}
              onSeatGuest={(guestId, tableId) => setGuests(gs => gs.map(g => g.id === guestId ? { ...g, tableId } : g))}
              onReorderGuests={setGuests}
              onOpenGuests={() => setView("guests")}
              sessionId={sessionId}
              planId={String(activePlan.id)}
            />
          </div>
        </div>
      )}

      {/* Список гостей */}
      {view === "guests" && activePlan && (
        <div className="flex flex-col h-[calc(100vh-65px)]">
          <div className="flex items-center gap-4 px-6 py-3" style={{ borderBottom: "1px solid rgba(201,169,110,0.1)" }}>
            <button onClick={() => setView("editor")} className="flex items-center gap-1 font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.4)" }}>
              <Icon name="ChevronLeft" size={14} /> Схема зала
            </button>
            <span className="font-cormorant text-lg" style={{ color: "var(--cream)" }}>{planTitle} — Гости</span>
          </div>
          <div className="flex-1 overflow-y-auto">
            <GuestManager
              planId={String(activePlan.id)}
              planTitle={planTitle}
              guests={guests}
              tables={tables}
              onGuestsChange={setGuests}
              sessionId={sessionId}
            />
          </div>
        </div>
      )}

      {/* Лендинг */}
      {view === "landing" && (
        <div className="max-w-5xl mx-auto px-6 py-16">
          {/* Hero */}
          <div className="text-center mb-16">
            <div className="font-montserrat text-xs tracking-[0.4em] uppercase mb-4" style={{ color: "rgba(201,169,110,0.6)" }}>Инструмент организатора</div>
            <h1 className="font-cormorant mb-4" style={{ fontSize: "3rem", fontWeight: 300, color: "var(--cream)", lineHeight: 1.2 }}>
              Планировщик рассадки
            </h1>
            <p className="font-montserrat text-sm max-w-xl mx-auto" style={{ color: "rgba(245,237,216,0.5)", lineHeight: 1.8 }}>
              Расставьте столы в зале, добавьте гостей и назначьте каждому место.<br />
              Скачайте готовую схему для распечатки.
            </p>
          </div>

          {/* Если авторизован — список планов */}
          {user ? (
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="font-montserrat text-xs tracking-widest uppercase" style={{ color: "rgba(201,169,110,0.6)" }}>Мои планы</div>
                <button onClick={createPlan} className="flex items-center gap-2 font-montserrat text-xs tracking-widest uppercase px-5 py-2.5 transition-all"
                  style={{ background: "var(--gold)", color: "var(--velvet)" }}>
                  <Icon name="Plus" size={13} /> Новый план
                </button>
              </div>
              {plans.length === 0 ? (
                <div className="text-center py-16" style={{ border: "1px solid rgba(201,169,110,0.1)" }}>
                  <div className="font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.3)" }}>Планов ещё нет</div>
                  <button onClick={createPlan} className="mt-4 font-montserrat text-xs tracking-widest uppercase px-5 py-2.5"
                    style={{ border: "1px solid var(--gold)", color: "var(--gold)" }}>
                    Создать первый план
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {plans.map(plan => (
                    <div key={plan.id} className="p-5 cursor-pointer transition-all group"
                      style={{ border: "1px solid rgba(201,169,110,0.15)", background: "rgba(201,169,110,0.03)" }}
                      onClick={() => openPlan(plan)}>
                      <div className="flex items-start justify-between mb-3">
                        <Icon name="Layout" size={18} style={{ color: "rgba(201,169,110,0.5)" }} />
                        <button onClick={e => { e.stopPropagation(); deletePlan(plan.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: "rgba(245,237,216,0.3)" }}>
                          <Icon name="Trash2" size={14} />
                        </button>
                      </div>
                      <div className="font-cormorant text-lg mb-1" style={{ color: "var(--cream)" }}>{plan.title}</div>
                      {plan.event_date && <div className="font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.35)" }}>{plan.event_date}</div>}
                      <div className="mt-3 font-montserrat text-xs tracking-widest uppercase" style={{ color: "rgba(201,169,110,0.5)" }}>
                        Открыть →
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Не авторизован */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <button onClick={createPlan} className="p-8 text-left transition-all group"
                style={{ border: "1px solid rgba(201,169,110,0.2)", background: "rgba(201,169,110,0.03)" }}>
                <Icon name="MousePointer" size={28} style={{ color: "rgba(201,169,110,0.6)", marginBottom: 16 }} />
                <div className="font-cormorant text-xl mb-2" style={{ color: "var(--cream)" }}>Начать сейчас</div>
                <div className="font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.45)", lineHeight: 1.7 }}>
                  Без регистрации. План сохраняется в браузере — войдите позже, чтобы не потерять.
                </div>
              </button>
              <button onClick={() => setShowAuth(true)} className="p-8 text-left transition-all"
                style={{ border: "1px solid var(--gold)", background: "rgba(201,169,110,0.05)" }}>
                <Icon name="UserPlus" size={28} style={{ color: "var(--gold)", marginBottom: 16 }} />
                <div className="font-cormorant text-xl mb-2" style={{ color: "var(--gold)" }}>Войти / Зарегистрироваться</div>
                <div className="font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.45)", lineHeight: 1.7 }}>
                  Храните несколько планов, редактируйте с любого устройства.
                </div>
              </button>
            </div>
          )}

          {/* Фичи */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12" style={{ borderTop: "1px solid rgba(201,169,110,0.1)" }}>
            {[
              { icon: "Move", title: "Drag & Drop", desc: "Перетаскивайте столы по залу" },
              { icon: "Users", title: "Список гостей", desc: "Привяжите каждого к столу" },
              { icon: "Shapes", title: "Разные столы", desc: "Круглые, прямоугольные, овальные, ряды" },
              { icon: "Download", title: "Скачать схему", desc: "Готовое изображение для печати" },
            ].map((f, i) => (
              <div key={i} className="text-center">
                <Icon name={f.icon} size={24} style={{ color: "rgba(201,169,110,0.5)", margin: "0 auto 10px" }} />
                <div className="font-montserrat text-xs tracking-widest uppercase mb-1" style={{ color: "var(--gold-light)" }}>{f.title}</div>
                <div className="font-montserrat text-xs" style={{ color: "rgba(245,237,216,0.35)", lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Модал авторизации */}
      {showAuth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.7)" }}>
          <div className="w-full max-w-sm mx-4 p-8" style={{ background: "#0d0b08", border: "1px solid rgba(201,169,110,0.3)" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="font-cormorant text-xl" style={{ color: "var(--gold)" }}>
                {authTab === "login" ? "Вход" : "Регистрация"}
              </div>
              <button onClick={() => setShowAuth(false)} style={{ color: "rgba(245,237,216,0.4)" }}>
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="flex gap-2 mb-6">
              {(["login", "register"] as AuthTab[]).map(tab => (
                <button key={tab} onClick={() => { setAuthTab(tab); setAuthError(""); }}
                  className="flex-1 py-2 font-montserrat text-xs tracking-widest uppercase transition-all"
                  style={{ background: authTab === tab ? "rgba(201,169,110,0.15)" : "transparent", border: `1px solid ${authTab === tab ? "var(--gold)" : "rgba(201,169,110,0.2)"}`, color: authTab === tab ? "var(--gold)" : "rgba(245,237,216,0.4)" }}>
                  {tab === "login" ? "Вход" : "Регистрация"}
                </button>
              ))}
            </div>
            <form onSubmit={handleAuth} className="space-y-4">
              {authTab === "register" && (
                <input type="text" placeholder="Имя" value={authName} onChange={e => setAuthName(e.target.value)} required
                  className="w-full bg-transparent outline-none font-montserrat text-sm py-2 px-3"
                  style={{ border: "1px solid rgba(201,169,110,0.25)", color: "var(--cream)" }} />
              )}
              <input type="email" placeholder="Email" value={authEmail} onChange={e => setAuthEmail(e.target.value)} required
                className="w-full bg-transparent outline-none font-montserrat text-sm py-2 px-3"
                style={{ border: "1px solid rgba(201,169,110,0.25)", color: "var(--cream)" }} />
              <input type="password" placeholder="Пароль" value={authPassword} onChange={e => setAuthPassword(e.target.value)} required
                className="w-full bg-transparent outline-none font-montserrat text-sm py-2 px-3"
                style={{ border: "1px solid rgba(201,169,110,0.25)", color: "var(--cream)" }} />
              {authError && <div className="font-montserrat text-xs" style={{ color: "#e87070" }}>{authError}</div>}
              <button type="submit" disabled={authLoading}
                className="w-full py-3 font-montserrat text-xs tracking-widest uppercase transition-all"
                style={{ background: "var(--gold)", color: "var(--velvet)", opacity: authLoading ? 0.7 : 1 }}>
                {authLoading ? "..." : authTab === "login" ? "Войти" : "Зарегистрироваться"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}