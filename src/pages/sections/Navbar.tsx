import Icon from "@/components/ui/icon";

const NAV = [
  { id: "home", label: "Главная" },
  { id: "portfolio", label: "Портфолио" },
  { id: "services", label: "Услуги" },
  { id: "calculator", label: "Калькулятор" },
  { id: "about", label: "О нас" },
  { id: "reviews", label: "Отзывы" },
  { id: "contacts", label: "Контакты" },
];

const PLANNER_LINK = "/planner";

type NavbarProps = {
  scrolled: boolean;
  activeNav: string;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  scrollTo: (id: string) => void;
};

export default function Navbar({ scrolled, activeNav, menuOpen, setMenuOpen, scrollTo }: NavbarProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
      style={{
        background: scrolled ? "rgba(13,11,8,0.97)" : "transparent",
        borderBottom: scrolled ? "1px solid rgba(201,169,110,0.2)" : "none",
        backdropFilter: scrolled ? "blur(12px)" : "none",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="font-cormorant text-xl tracking-widest" style={{ color: "var(--gold)" }}>
          La Belle Époque
        </div>
        <div className="hidden md:flex items-center gap-8">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => scrollTo(n.id)}
              className="font-montserrat text-xs uppercase transition-all duration-300"
              style={{
                color: activeNav === n.id ? "var(--gold)" : "rgba(245,237,216,0.6)",
                letterSpacing: "0.12em",
              }}
            >
              {n.label}
            </button>
          ))}
          <a href={PLANNER_LINK}
            className="font-montserrat text-xs uppercase tracking-widest px-3 py-1.5 transition-all duration-300 flex items-center gap-1.5"
            style={{ border: "1px solid rgba(201,169,110,0.4)", color: "var(--gold)" }}>
            <Icon name="Layout" size={11} />
            Планировщик
          </a>
        </div>
        <button className="md:hidden" style={{ color: "var(--gold)" }} onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? "X" : "Menu"} size={22} />
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden py-6 px-6 flex flex-col gap-5" style={{ background: "rgba(13,11,8,0.98)", borderTop: "1px solid rgba(201,169,110,0.15)" }}>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => scrollTo(n.id)} className="font-montserrat text-xs tracking-widest uppercase text-left" style={{ color: "var(--gold-light)" }}>
              {n.label}
            </button>
          ))}
          <a href={PLANNER_LINK} className="font-montserrat text-xs tracking-widest uppercase flex items-center gap-2" style={{ color: "var(--gold)" }}>
            <Icon name="Layout" size={12} /> Планировщик
          </a>
        </div>
      )}
    </nav>
  );
}