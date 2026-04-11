type GuestsSelectorProps = {
  guests: number;
  setGuests: (v: number | ((g: number) => number)) => void;
};

export default function GuestsSelector({ guests, setGuests }: GuestsSelectorProps) {
  return (
    <div className="mb-8 p-6" style={{ border: "1px solid rgba(201,169,110,0.2)", background: "rgba(201,169,110,0.03)" }}>
      <div className="flex items-center justify-between mb-4">
        <span className="font-montserrat text-xs tracking-widest uppercase" style={{ color: "var(--gold)" }}>Количество гостей</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setGuests(g => Math.max(1, g - 1))}
            className="w-8 h-8 flex items-center justify-center transition-all duration-200 font-cormorant text-lg"
            style={{ border: "1px solid rgba(201,169,110,0.4)", color: "var(--gold)", background: "transparent", lineHeight: 1 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,169,110,0.1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >−</button>
          <input
            type="number"
            min={1}
            max={500}
            value={guests}
            onChange={(e) => {
              const v = Math.min(500, Math.max(1, Number(e.target.value) || 1));
              setGuests(v);
            }}
            className="bg-transparent outline-none font-cormorant text-3xl text-center"
            style={{ color: "var(--gold)", width: "72px", border: "none", MozAppearance: "textfield" } as React.CSSProperties}
          />
          <button
            onClick={() => setGuests(g => Math.min(500, g + 1))}
            className="w-8 h-8 flex items-center justify-center transition-all duration-200 font-cormorant text-lg"
            style={{ border: "1px solid rgba(201,169,110,0.4)", color: "var(--gold)", background: "transparent", lineHeight: 1 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(201,169,110,0.1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >+</button>
        </div>
      </div>
      <input type="range" min={1} max={500} step={1} value={guests}
        onChange={(e) => setGuests(Number(e.target.value))}
        className="w-full" style={{ accentColor: "var(--gold)", height: "2px", cursor: "pointer" }} />
      <div className="flex justify-between font-montserrat text-xs mt-2" style={{ color: "rgba(245,237,216,0.3)" }}>
        <span>1</span><span>500</span>
      </div>
    </div>
  );
}
