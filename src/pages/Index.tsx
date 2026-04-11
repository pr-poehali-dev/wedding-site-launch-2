import { useState, useEffect } from "react";
import WeddingCalculator from "@/components/WeddingCalculator";
import Navbar from "./sections/Navbar";
import HeroAndPortfolio from "./sections/HeroAndPortfolio";
import AboutAndContacts from "./sections/AboutAndContacts";

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
      <Navbar
        scrolled={scrolled}
        activeNav={activeNav}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        scrollTo={scrollTo}
      />
      <HeroAndPortfolio
        visible={visible}
        lightbox={lightbox}
        setLightbox={setLightbox}
        scrollTo={scrollTo}
      />
      <WeddingCalculator />
      <AboutAndContacts
        visible={visible}
        scrollTo={scrollTo}
      />
    </div>
  );
}
