import Icon from "@/components/ui/icon";

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

type AboutAndContactsProps = {
  visible: Record<string, boolean>;
  scrollTo: (id: string) => void;
};

export default function AboutAndContacts({ visible, scrollTo }: AboutAndContactsProps) {
  return (
    <>
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
    </>
  );
}
