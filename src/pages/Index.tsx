import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const GALLERY_IMAGES = [
  {
    src: "https://cdn.poehali.dev/projects/0278d3f1-7899-40bd-960b-c0c391ad5f80/files/06ea7343-c968-49ab-b38b-30765b955dd2.jpg",
    title: "Банкетный зал",
    category: "Интерьер",
  },
  {
    src: "https://cdn.poehali.dev/projects/0278d3f1-7899-40bd-960b-c0c391ad5f80/files/5e49c8dd-7c9b-4b8d-9a79-4f914b9a9b2c.jpg",
    title: "Свадебная арка",
    category: "Флористика",
  },
  {
    src: "https://cdn.poehali.dev/projects/0278d3f1-7899-40bd-960b-c0c391ad5f80/files/f68219e5-c22b-41b7-acfe-18aebd4f03a9.jpg",
    title: "Зал торжеств",
    category: "Оформление",
  },
  {
    src: "https://cdn.poehali.dev/projects/0278d3f1-7899-40bd-960b-c0c391ad5f80/files/06ea7343-c968-49ab-b38b-30765b955dd2.jpg",
    title: "Сервировка стола",
    category: "Декор",
  },
  {
    src: "https://cdn.poehali.dev/projects/0278d3f1-7899-40bd-960b-c0c391ad5f80/files/5e49c8dd-7c9b-4b8d-9a79-4f914b9a9b2c.jpg",
    title: "Арочные конструкции",
    category: "Флористика",
  },
  {
    src: "https://cdn.poehali.dev/projects/0278d3f1-7899-40bd-960b-c0c391ad5f80/files/f68219e5-c22b-41b7-acfe-18aebd4f03a9.jpg",
    title: "Вечерний банкет",
    category: "Интерьер",
  },
];

const SERVICES = [
  {
    icon: "Flower2",
    title: "Флористика & декор",
    desc: "Авторские флористические композиции, живые цветы, гирлянды и зелёные инсталляции для вашего торжества.",
    price: "от 150 000 ₽",
  },
  {
    icon: "Lamp",
    title: "Световые инсталляции",
    desc: "Хрустальные люстры, гирлянды, точечная подсветка и атмосферные световые решения для любого пространства.",
    price: "от 80 000 ₽",
  },
  {
    icon: "Gem",
    title: "Комплексное оформление",
    desc: "Полный цикл — от концепции и визуализации до монтажа и демонтажа в день торжества.",
    price: "от 350 000 ₽",
  },
  {
    icon: "Crown",
    title: "Выездная регистрация",
    desc: "Оформление места церемонии: арки, ковровая дорожка, флористика, стулья, свечи и аксессуары.",
    price: "от 120 000 ₽",
  },
];

const REVIEWS = [
  {
    name: "Анастасия и Михаил",
    date: "Сентябрь 2024",
    text: "Наша свадьба превзошла все ожидания. Каждая деталь была продумана до совершенства — от свежих пионов до хрустальных люстр. Это было настоящее волшебство.",
    rating: 5,
  },
  {
    name: "Екатерина Волкова",
    date: "Июнь 2024",
    text: "Заказывала оформление юбилея. Команда работала профессионально и с душой. Гости до сих пор вспоминают убранство зала. Рекомендую без сомнений.",
    rating: 5,
  },
  {
    name: "Виктория и Дмитрий",
    date: "Август 2024",
    text: "Невероятная работа! Концепция была реализована в точности, как на визуализации. Особенно восхитила цветочная арка — просто произведение искусства.",
    rating: 5,
  },
];

const STATS = [
  { value: "350+", label: "Событий оформлено" },
  { value: "8", label: "Лет на рынке" },
  { value: "98%", label: "Довольных клиентов" },
  { value: "15", label: "Наград отрасли" },
];

const NAV = [
  { id: "home", label: "Главная" },
  { id: "portfolio", label: "Портфолио" },
  { id: "services", label: "Услуги" },
  { id: "about", label: "О нас" },
  { id: "reviews", label: "Отзывы" },
  { id: "contacts", label: "Контакты" },
];

export default function Index() {
  const [activeNav, setActiveNav] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll("[data-observe]").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = lightbox !== null ? "hidden" : "";
  }, [lightbox]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveNav(id);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--velvet)", color: "var(--cream)" }}>

      {/* NAVBAR */}
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
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(https://cdn.poehali.dev/projects/0278d3f1-7899-40bd-960b-c0c391ad5f80/files/f68219e5-c22b-41b7-acfe-18aebd4f03a9.jpg)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.22)",
          }}
        />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(201,169,110,0.06) 0%, rgba(13,11,8,0.75) 70%)" }} />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="font-montserrat text-xs tracking-[0.4em] uppercase mb-8 animate-fade-up" style={{ color: "var(--gold)", opacity: 0, animationFillMode: "forwards" }}>
            ✦ Свадебное оформление премиум-класса ✦
          </div>
          <h1
            className="font-cormorant mb-6 leading-none animate-fade-up delay-200"
            style={{ fontSize: "clamp(3.5rem, 9vw, 8rem)", fontWeight: 300, color: "var(--cream)", opacity: 0, animationFillMode: "forwards" }}
          >
            La Belle
            <br />
            <em style={{ color: "var(--gold)" }}>Époque</em>
          </h1>
          <div className="gold-divider max-w-xs mx-auto mb-8 animate-fade-up delay-300" style={{ opacity: 0, animationFillMode: "forwards" }} />
          <p
            className="font-montserrat text-sm leading-relaxed mx-auto mb-12 animate-fade-up delay-400"
            style={{ color: "rgba(245,237,216,0.65)", letterSpacing: "0.04em", maxWidth: "460px", opacity: 0, animationFillMode: "forwards" }}
          >
            Превращаем ваш особенный день в произведение искусства.
            Роскошный декор, флористика и световые инсталляции
            для незабываемых торжеств.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up delay-500" style={{ opacity: 0, animationFillMode: "forwards" }}>
            <button className="gold-btn px-10 py-4 relative" onClick={() => scrollTo("contacts")}>
              <span>Обсудить проект</span>
            </button>
            <button
              className="px-10 py-4 font-montserrat text-xs tracking-widest uppercase transition-all duration-300"
              style={{ border: "1px solid rgba(201,169,110,0.4)", color: "var(--gold-light)", background: "transparent", letterSpacing: "0.15em" }}
              onClick={() => scrollTo("portfolio")}
            >
              Смотреть работы
            </button>
          </div>
        </div>

        <button
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          style={{ color: "var(--gold)", opacity: 0.5 }}
          onClick={() => scrollTo("portfolio")}
        >
          <span className="font-montserrat text-xs tracking-widest uppercase">Листайте</span>
          <Icon name="ChevronDown" size={16} />
        </button>
      </section>

      {/* STATS */}
      <section style={{ background: "rgba(201,169,110,0.05)", borderTop: "1px solid rgba(201,169,110,0.15)", borderBottom: "1px solid rgba(201,169,110,0.15)" }}>
        <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <div className="font-cormorant mb-1" style={{ fontSize: "2.8rem", fontWeight: 300, color: "var(--gold)" }}>{s.value}</div>
              <div className="font-montserrat text-xs tracking-widest uppercase" style={{ color: "rgba(245,237,216,0.45)" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PORTFOLIO */}
      <section id="portfolio" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div
            id="portfolio-title"
            data-observe="true"
            className="text-center mb-16"
            style={{ opacity: visible["portfolio-title"] ? 1 : 0, transform: visible["portfolio-title"] ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}
          >
            <div className="font-montserrat text-xs tracking-[0.4em] uppercase mb-4" style={{ color: "var(--gold)" }}>✦ Наши работы ✦</div>
            <h2 className="section-title" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>Портфолио</h2>
            <div className="gold-divider max-w-xs mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {GALLERY_IMAGES.map((img, i) => (
              <div
                key={i}
                id={`gallery-${i}`}
                data-observe="true"
                className="gallery-item cursor-pointer relative overflow-hidden"
                style={{
                  aspectRatio: "4/3",
                  opacity: visible[`gallery-${i}`] ? 1 : 0,
                  transform: visible[`gallery-${i}`] ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.7s ease ${i * 0.1}s`,
                }}
                onClick={() => setLightbox(i)}
              >
                <img src={img.src} alt={img.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col justify-end p-5 opacity-0 hover:opacity-100 transition-opacity duration-400" style={{ background: "linear-gradient(to top, rgba(13,11,8,0.85) 0%, transparent 60%)", zIndex: 2 }}>
                  <div className="font-montserrat text-xs tracking-widest uppercase mb-1" style={{ color: "var(--gold)" }}>{img.category}</div>
                  <div className="font-cormorant text-xl" style={{ color: "var(--cream)" }}>{img.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="gold-btn px-10 py-4 relative" onClick={() => scrollTo("contacts")}>
              <span>Заказать оформление</span>
            </button>
          </div>
        </div>
      </section>

      {/* LIGHTBOX */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.95)" }} onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6" style={{ color: "var(--gold)" }} onClick={() => setLightbox(null)}>
            <Icon name="X" size={28} />
          </button>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--gold)" }}
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length); }}
          >
            <Icon name="ChevronLeft" size={40} />
          </button>
          <img src={GALLERY_IMAGES[lightbox].src} alt={GALLERY_IMAGES[lightbox].title} className="max-h-[85vh] max-w-[85vw] object-contain" onClick={(e) => e.stopPropagation()} />
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2"
            style={{ color: "var(--gold)" }}
            onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % GALLERY_IMAGES.length); }}
          >
            <Icon name="ChevronRight" size={40} />
          </button>
          <div className="absolute bottom-8 text-center">
            <div className="font-cormorant text-xl mb-1" style={{ color: "var(--cream)" }}>{GALLERY_IMAGES[lightbox].title}</div>
            <div className="font-montserrat text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>{GALLERY_IMAGES[lightbox].category}</div>
          </div>
        </div>
      )}

      {/* SERVICES */}
      <section id="services" className="py-24 px-6" style={{ background: "rgba(201,169,110,0.04)" }}>
        <div className="max-w-6xl mx-auto">
          <div
            id="services-title"
            data-observe="true"
            className="text-center mb-16"
            style={{ opacity: visible["services-title"] ? 1 : 0, transform: visible["services-title"] ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}
          >
            <div className="font-montserrat text-xs tracking-[0.4em] uppercase mb-4" style={{ color: "var(--gold)" }}>✦ Что мы предлагаем ✦</div>
            <h2 className="section-title" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>Услуги</h2>
            <div className="gold-divider max-w-xs mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {SERVICES.map((s, i) => (
              <div
                key={i}
                id={`service-${i}`}
                data-observe="true"
                className="p-8 transition-all duration-400 cursor-default"
                style={{
                  background: "rgba(201,169,110,0.04)",
                  border: "1px solid rgba(201,169,110,0.15)",
                  opacity: visible[`service-${i}`] ? 1 : 0,
                  transform: visible[`service-${i}`] ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.7s ease ${i * 0.1}s`,
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,110,0.4)"; (e.currentTarget as HTMLElement).style.background = "rgba(201,169,110,0.08)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(201,169,110,0.15)"; (e.currentTarget as HTMLElement).style.background = "rgba(201,169,110,0.04)"; }}
              >
                <div className="flex items-start gap-6">
                  <div className="w-12 h-12 flex items-center justify-center flex-shrink-0" style={{ border: "1px solid rgba(201,169,110,0.3)" }}>
                    <Icon name={s.icon} size={20} style={{ color: "var(--gold)" }} />
                  </div>
                  <div>
                    <h3 className="font-cormorant text-2xl mb-3" style={{ color: "var(--gold-light)" }}>{s.title}</h3>
                    <p className="font-montserrat text-sm leading-relaxed mb-4" style={{ color: "rgba(245,237,216,0.6)" }}>{s.desc}</p>
                    <div className="font-cormorant text-xl" style={{ color: "var(--gold)" }}>{s.price}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div
              id="about-img"
              data-observe="true"
              className="relative"
              style={{ opacity: visible["about-img"] ? 1 : 0, transform: visible["about-img"] ? "translateX(0)" : "translateX(-30px)", transition: "all 0.9s ease" }}
            >
              <img
                src="https://cdn.poehali.dev/projects/0278d3f1-7899-40bd-960b-c0c391ad5f80/files/5e49c8dd-7c9b-4b8d-9a79-4f914b9a9b2c.jpg"
                alt="О компании"
                className="w-full object-cover"
                style={{ aspectRatio: "4/5", filter: "brightness(0.8)" }}
              />
              <div className="absolute -bottom-6 -right-6 p-8 text-center" style={{ background: "rgba(13,11,8,0.97)", border: "1px solid rgba(201,169,110,0.3)", minWidth: "160px" }}>
                <div className="font-cormorant text-5xl" style={{ color: "var(--gold)", fontWeight: 300 }}>8</div>
                <div className="font-montserrat text-xs tracking-widest uppercase mt-1" style={{ color: "rgba(245,237,216,0.45)" }}>лет традиций</div>
              </div>
            </div>

            <div
              id="about-text"
              data-observe="true"
              style={{ opacity: visible["about-text"] ? 1 : 0, transform: visible["about-text"] ? "translateX(0)" : "translateX(30px)", transition: "all 0.9s ease 0.2s" }}
            >
              <div className="font-montserrat text-xs tracking-[0.4em] uppercase mb-4" style={{ color: "var(--gold)" }}>✦ Наша история ✦</div>
              <h2 className="section-title mb-6" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)" }}>О нас</h2>
              <div className="gold-divider mb-8" style={{ maxWidth: "80px" }} />
              <p className="font-montserrat text-sm leading-loose mb-6" style={{ color: "rgba(245,237,216,0.65)" }}>
                La Belle Époque — студия роскошного свадебного оформления с восьмилетней историей. Мы создаём пространства, где каждый элемент рассказывает вашу историю.
              </p>
              <p className="font-montserrat text-sm leading-loose mb-10" style={{ color: "rgba(245,237,216,0.65)" }}>
                Наша команда — флористы, дизайнеры интерьера и световые художники, объединённые страстью к красоте и совершенству. Работаем только с лучшими поставщиками Европы.
              </p>
              <div className="grid grid-cols-3 gap-6 mb-10">
                {[{ v: "350+", l: "Событий" }, { v: "25", l: "Мастеров" }, { v: "12", l: "Городов" }].map((item, i) => (
                  <div key={i} className="text-center" style={{ borderLeft: "1px solid rgba(201,169,110,0.2)", paddingLeft: "1rem" }}>
                    <div className="font-cormorant text-3xl" style={{ color: "var(--gold)" }}>{item.v}</div>
                    <div className="font-montserrat text-xs tracking-widest uppercase mt-1" style={{ color: "rgba(245,237,216,0.4)" }}>{item.l}</div>
                  </div>
                ))}
              </div>
              <button className="gold-btn px-10 py-4 relative" onClick={() => scrollTo("contacts")}>
                <span>Связаться с нами</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section
        id="reviews"
        className="py-24 px-6"
        style={{ background: "rgba(201,169,110,0.04)", borderTop: "1px solid rgba(201,169,110,0.1)", borderBottom: "1px solid rgba(201,169,110,0.1)" }}
      >
        <div className="max-w-6xl mx-auto">
          <div
            id="reviews-title"
            data-observe="true"
            className="text-center mb-16"
            style={{ opacity: visible["reviews-title"] ? 1 : 0, transform: visible["reviews-title"] ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}
          >
            <div className="font-montserrat text-xs tracking-[0.4em] uppercase mb-4" style={{ color: "var(--gold)" }}>✦ Голоса клиентов ✦</div>
            <h2 className="section-title" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>Отзывы</h2>
            <div className="gold-divider max-w-xs mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REVIEWS.map((r, i) => (
              <div
                key={i}
                id={`review-${i}`}
                data-observe="true"
                className="p-8"
                style={{
                  background: "rgba(13,11,8,0.8)",
                  border: "1px solid rgba(201,169,110,0.15)",
                  opacity: visible[`review-${i}`] ? 1 : 0,
                  transform: visible[`review-${i}`] ? "translateY(0)" : "translateY(20px)",
                  transition: `all 0.7s ease ${i * 0.15}s`,
                }}
              >
                <div className="flex mb-5">
                  {Array.from({ length: r.rating }).map((_, j) => (
                    <span key={j} style={{ color: "var(--gold)", fontSize: "12px", marginRight: "3px" }}>✦</span>
                  ))}
                </div>
                <p className="font-montserrat text-sm leading-loose mb-6" style={{ color: "rgba(245,237,216,0.65)", fontStyle: "italic" }}>
                  «{r.text}»
                </p>
                <div className="gold-divider mb-5" />
                <div className="font-cormorant text-lg" style={{ color: "var(--gold-light)" }}>{r.name}</div>
                <div className="font-montserrat text-xs tracking-widest mt-1" style={{ color: "rgba(245,237,216,0.3)" }}>{r.date}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div
            id="contacts-title"
            data-observe="true"
            className="text-center mb-16"
            style={{ opacity: visible["contacts-title"] ? 1 : 0, transform: visible["contacts-title"] ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease" }}
          >
            <div className="font-montserrat text-xs tracking-[0.4em] uppercase mb-4" style={{ color: "var(--gold)" }}>✦ Начнём создавать ✦</div>
            <h2 className="section-title" style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)" }}>Контакты</h2>
            <div className="gold-divider max-w-xs mx-auto mt-6 mb-6" />
            <p className="font-montserrat text-sm" style={{ color: "rgba(245,237,216,0.45)" }}>
              Расскажите о вашем торжестве — мы воплотим его в жизнь
            </p>
          </div>

          <div
            id="contacts-form"
            data-observe="true"
            style={{ opacity: visible["contacts-form"] ? 1 : 0, transform: visible["contacts-form"] ? "translateY(0)" : "translateY(20px)", transition: "all 0.8s ease 0.2s" }}
          >
            <div className="p-10 mb-8" style={{ border: "1px solid rgba(201,169,110,0.2)", background: "rgba(201,169,110,0.03)" }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {[
                  { label: "Ваше имя", placeholder: "Анастасия" },
                  { label: "Телефон", placeholder: "+7 (999) 000-00-00" },
                  { label: "Email", placeholder: "hello@example.com" },
                  { label: "Дата события", placeholder: "Месяц, год" },
                ].map((field, i) => (
                  <div key={i}>
                    <label className="block font-montserrat text-xs tracking-widest uppercase mb-3" style={{ color: "var(--gold)" }}>
                      {field.label}
                    </label>
                    <input
                      type="text"
                      placeholder={field.placeholder}
                      className="w-full py-3 font-montserrat text-sm bg-transparent outline-none"
                      style={{ borderBottom: "1px solid rgba(201,169,110,0.3)", color: "var(--cream)" }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "var(--gold)")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "rgba(201,169,110,0.3)")}
                    />
                  </div>
                ))}
              </div>
              <div className="mb-8">
                <label className="block font-montserrat text-xs tracking-widest uppercase mb-3" style={{ color: "var(--gold)" }}>
                  Пожелания и детали
                </label>
                <textarea
                  rows={4}
                  placeholder="Расскажите о концепции, количестве гостей, бюджете..."
                  className="w-full py-3 font-montserrat text-sm bg-transparent outline-none resize-none"
                  style={{ borderBottom: "1px solid rgba(201,169,110,0.3)", color: "var(--cream)" }}
                  onFocus={(e) => (e.target.style.borderBottomColor = "var(--gold)")}
                  onBlur={(e) => (e.target.style.borderBottomColor = "rgba(201,169,110,0.3)")}
                />
              </div>
              <button className="gold-btn px-12 py-4 w-full relative">
                <span>Отправить заявку</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: "Phone", label: "Телефон", value: "+7 (495) 000-00-00" },
                { icon: "Mail", label: "Email", value: "info@labelleepoque.ru" },
                { icon: "MapPin", label: "Адрес", value: "Москва, Пречистенка, 1" },
              ].map((c, i) => (
                <div key={i} className="text-center py-6 px-4" style={{ border: "1px solid rgba(201,169,110,0.12)" }}>
                  <div className="flex justify-center mb-3">
                    <Icon name={c.icon} size={18} style={{ color: "var(--gold)" }} />
                  </div>
                  <div className="font-montserrat text-xs tracking-widest uppercase mb-2" style={{ color: "rgba(245,237,216,0.35)" }}>{c.label}</div>
                  <div className="font-cormorant text-lg" style={{ color: "var(--gold-light)" }}>{c.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid rgba(201,169,110,0.15)", background: "rgba(0,0,0,0.5)" }}>
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="font-cormorant text-xl tracking-widest" style={{ color: "var(--gold)" }}>La Belle Époque</div>
          <div className="font-montserrat text-xs tracking-widest" style={{ color: "rgba(245,237,216,0.25)" }}>
            © 2024 La Belle Époque. Все права защищены.
          </div>
          <div className="flex gap-5">
            {["Instagram", "Vk", "MessageCircle"].map((icon, i) => (
              <button key={i} style={{ color: "rgba(201,169,110,0.4)" }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--gold)")}
                onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "rgba(201,169,110,0.4)")}
              >
                <Icon name={icon} size={18} />
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
