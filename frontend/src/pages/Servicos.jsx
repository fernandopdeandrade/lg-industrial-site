import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SERVICES } from "@/lib/constants";
import { Reveal, MaskedLine } from "@/components/Reveal";
import EditorialMarquee from "@/components/EditorialMarquee";

export default function Servicos() {
  return (
    <div data-testid="servicos-page">
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-16">
        <p className="overline-label mb-6">Serviços</p>
        <h1 className="font-display font-black tracking-tighter leading-[0.92] text-5xl sm:text-6xl md:text-7xl text-cream" data-testid="servicos-title">
          <MaskedLine delay={0.1}>DO DIAGNÓSTICO</MaskedLine>
          <MaskedLine delay={0.25}>
            <span className="font-serif italic font-medium text-earth">ao campo.</span>
          </MaskedLine>
        </h1>
        <Reveal delay={0.4}>
          <p className="mt-8 max-w-xl text-base md:text-lg text-stone font-light leading-relaxed">
            Manutenção completa de máquinas agrícolas com ferramentas e equipamentos de última geração.
            Oficina em Uruguaiana e unidade móvel para atender onde a sua lavoura estiver.
          </p>
        </Reveal>
      </section>

      <EditorialMarquee />

      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32 flex flex-col gap-24 md:gap-32">
        {SERVICES.map((s, i) => (
          <Reveal key={s.num}>
            <div
              className={`grid md:grid-cols-2 gap-10 md:gap-16 items-center ${i % 2 === 1 ? "md:[direction:rtl]" : ""}`}
              data-testid={`servico-block-${s.num}`}
            >
              <div className="[direction:ltr]">
                <div className="clip-corner overflow-hidden h-72 md:h-96 group">
                  <img
                    src={s.image}
                    alt={s.title}
                    className="w-full h-full object-cover grayscale-[35%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                  />
                </div>
              </div>
              <div className="[direction:ltr]">
                <span className="font-serif italic text-6xl md:text-8xl text-earth/30">{s.num}</span>
                <h2 className="mt-2 font-display font-bold tracking-tight text-3xl sm:text-4xl text-cream">{s.title}</h2>
                <p className="mt-5 text-stone text-base leading-relaxed max-w-md">{s.desc}</p>
                <Link
                  to="/contato"
                  data-testid={`servico-cta-${s.num}`}
                  className="group mt-8 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-earth hover:text-mist transition-colors"
                >
                  Agendar este serviço
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </div>
            </div>
          </Reveal>
        ))}
      </section>

      <section className="border-t border-white/5 bg-surface/50">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 text-center">
          <Reveal>
            <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl text-cream">
              Precisa de atendimento <span className="font-serif italic font-medium text-earth">agora?</span>
            </h2>
            <Link
              to="/contato"
              data-testid="servicos-cta-btn"
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
