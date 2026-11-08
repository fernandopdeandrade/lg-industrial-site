import Marquee from "react-fast-marquee";

const ITEMS = [
  "Tecnologia de ponta em manutenção agrícola",
  "LG Industrial",
  "Uruguaiana — Rio Grande do Sul",
  "Diagnóstico · Manutenção · Campo",
  "Máquinas de última geração",
];

export default function EditorialMarquee() {
  return (
    <div
      className="border-y border-white/5 bg-[#0D120E] py-6 overflow-hidden"
      data-testid="editorial-marquee"
    >
      <Marquee speed={28} gradient={false}>
        {ITEMS.map((t, i) => (
          <span
            key={i}
            className="font-serif italic text-2xl md:text-3xl text-earth/70 whitespace-nowrap"
          >
            {t}
            <span className="mx-16 text-leaf/50 not-italic">—</span>
          </span>
        ))}
      </Marquee>
    </div>
  );
}
