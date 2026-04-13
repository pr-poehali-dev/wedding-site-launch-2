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

const STATS = [
  { value: "500+", label: "Событий оформлено" },
  { value: "15", label: "Лет на рынке" },
  { value: "100+", label: "Постоянных клиентов" },
  { value: "3", label: "Города присутствия" },
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

type HeroAndPortfolioProps = {
  visible: Record<string, boolean>;
  lightbox: number | null;
  setLightbox: (v: number | null) => void;
  scrollTo: (id: string) => void;
};

export default function HeroAndPortfolio({ visible, lightbox, setLightbox, scrollTo }: HeroAndPortfolioProps) {
  return (
    <>
      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Фото пары — основной фон */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(https://cdn.poehali.dev/projects/0278d3f1-7899-40bd-960b-c0c391ad5f80/bucket/9f81ab62-13f2-42d0-a188-367918d8b62e.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center top",
            filter: "brightness(0.35)",
          }}
        />
        {/* Градиент снизу для читаемости текста */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(13,11,8,0.2) 0%, rgba(13,11,8,0.5) 50%, rgba(13,11,8,0.92) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(201,169,110,0.04) 0%, rgba(13,11,8,0.3) 70%)" }} />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="font-montserrat text-xs tracking-[0.4em] uppercase mb-8 animate-fade-up" style={{ color: "var(--gold)", opacity: 0, animationFillMode: "forwards" }}>
            ✦ оформление свадеб ✦ корпоративов ✦ юбилеев ✦
          </div>
          <h1
            className="font-cormorant mb-2 leading-none animate-fade-up delay-200"
            style={{ fontSize: "clamp(2.2rem, 6vw, 5.5rem)", fontWeight: 400, fontStyle: "normal", color: "#ffffff", opacity: 0, animationFillMode: "forwards" }}
          >
            ЭЛЬВИРЫ ДАУТОВОЙ
          </h1>
          <div
            className="font-montserrat mb-6 animate-fade-up delay-200 tracking-[0.35em] uppercase"
            style={{ fontSize: "clamp(0.6rem, 1.2vw, 0.85rem)", color: "var(--gold)", opacity: 0, animationFillMode: "forwards" }}
          >
            Студия декора
          </div>
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
    </>
  );
}