import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { IMAGES } from "@/lib/constants";
import { Reveal, MaskedLine } from "@/components/Reveal";

const CHAPTERS = [
  {
    num: "01",
    title: "Raízes na fronteira",
    text: "A LG Industrial nasceu em Uruguaiana, no coração da fronteira oeste gaúcha, onde a lavoura e a pecuária dão o ritmo da vida. Crescemos ouvindo o mesmo problema de sempre: máquina boa parada por falta de manutenção especializada. Decidimos ser a resposta.",
  },
  {
    num: "02",
    title: "Oficina de última geração",
    text: "Investimos continuamente em scanners de diagnóstico multimarca, ferramental de precisão e capacitação técnica. O resultado é um nível de serviço que antes só existia nos grandes centros — agora disponível na porteira da sua fazenda.",
  },
  {
    num: "03",
    title: "Compromisso com quem produz",
    text: "Sabemos que no campo não existe segunda chance: a janela de plantio e colheita não espera. Por isso atendemos com agilidade, transparência no orçamento e garantia real de serviço. Nosso cliente é nosso vizinho — e vizinho a gente não deixa na mão.",
  },
];

export default function Sobre() {
  return (
    <div data-testid="sobre-page">
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-16">
        <p className="overline-label mb-6">Sobre nós</p>
        <h1 className="font-display font-black tracking-tighter leading-[0.92] text-5xl sm:text-6xl md:text-7xl text-cream" data-testid="sobre-title">
          <MaskedLine delay={0.1}>NOSSA</MaskedLine>
          <MaskedLine delay={0.25}>
            <span className="font-serif italic font-medium text-earth">história.</span>
          </MaskedLine>
        </h1>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <Reveal>
          <div className="clip-corner overflow-hidden h-[50vh] md:h-[65vh] relative">
            <img src={IMAGES.repair} alt="Equipe LG Industrial em manutenção" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-canvas/80 to-transparent" />
            <p className="absolute bottom-8 left-8 font-serif italic text-2xl md:text-3xl text-cream/90 max-w-md">
              "Precisão de fábrica, no meio do campo."
            </p>
          </div>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
        <p className="overline-label mb-12">Manifesto</p>
        <div className="flex flex-col gap-20">
          {CHAPTERS.map((c, i) => (
            <Reveal key={c.num} delay={i * 0.05}>
              <div className="grid md:grid-cols-[auto_1fr] gap-6 md:gap-16 items-start border-t border-white/5 pt-12" data-testid={`sobre-chapter-${c.num}`}>
                <span className="font-serif italic text-6xl md:text-8xl text-earth/30 leading-none">{c.num}</span>
                <div className="max-w-2xl">
                  <h2 className="font-display font-bold tracking-tight text-3xl sm:text-4xl text-cream">{c.title}</h2>
                  <p className="mt-5 text-stone text-base md:text-lg font-light leading-relaxed">{c.text}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-t border-white/5 bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24">
          <Reveal>
            <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-cream max-w-2xl leading-[0.95]">
              Venha tomar um café <span className="font-serif italic font-medium text-earth">na oficina.</span>
            </h2>
            <Link
              to="/contato"
              data-testid="sobre-cta-btn"
              className="group mt-10 inline-flex items-center gap-2 bg-leaf text-cream px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-leaf-light active:scale-95 transition-all duration-300"
            >
              Fale conosco
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
