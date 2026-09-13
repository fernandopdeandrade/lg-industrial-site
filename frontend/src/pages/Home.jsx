import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Wrench, Tractor, Cpu } from "lucide-react";
import { api } from "@/lib/api";
import { IMAGES, SERVICES } from "@/lib/constants";
import { MaskedLine, Reveal } from "@/components/Reveal";
import EditorialMarquee from "@/components/EditorialMarquee";
import QuoteDialog from "@/components/QuoteDialog";

const STATS = [
  { value: "15+", label: "Anos de estrada" },
  { value: "500+", label: "Máquinas atendidas" },
  { value: "24h", label: "Resposta em campo" },
  { value: "100%", label: "Diagnóstico eletrônico" },
];

const SERVICE_ICONS = [Cpu, Wrench, Tractor];

export default function Home() {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.25]);

  const [products, setProducts] = useState([]);
  useEffect(() => {
    api.get("/products").then((r) => {
      const featured = r.data.filter((p) => p.featured);
      setProducts((featured.length ? featured : r.data).slice(0, 3));
    }).catch(() => {});
  }, []);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section ref={heroRef} className="relative min-h-screen flex items-end overflow-hidden" data-testid="home-hero">
        <motion.div style={{ y: bgY, scale: bgScale }} className="absolute inset-0">
          <img src={IMAGES.heroTractor} alt="Trator em lavoura ao entardecer" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-canvas via-canvas/20 to-canvas/50" />
        </motion.div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pb-28 pt-48 w-full">
          <motion.p
            className="overline-label mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.8 }}
          >
            LG Industrial — Uruguaiana, RS
          </motion.p>
          <h1 className="font-display font-black tracking-tighter leading-[0.92] text-5xl sm:text-6xl md:text-8xl text-cream" data-testid="hero-title">
            <MaskedLine delay={0.15}>POTÊNCIA E</MaskedLine>
            <MaskedLine delay={0.32}>PRECISÃO</MaskedLine>
            <MaskedLine delay={0.49}>
              <span className="font-serif italic font-medium text-earth">no campo.</span>
            </MaskedLine>
          </h1>
          <motion.p
            className="mt-8 max-w-xl text-base md:text-lg text-stone font-light leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.85, duration: 0.8 }}
          >
            Manutenção de máquinas agrícolas com ferramentas e tecnologia de última geração.
            Diagnóstico eletrônico, atendimento em campo e peças de procedência.
          </motion.p>
          <motion.div
            className="mt-10 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.05, duration: 0.8 }}
          >
            <Link
              to="/produtos"
              data-testid="hero-products-btn"
              className="group inline-flex items-center gap-2 bg-leaf text-cream px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-leaf-light active:scale-95 transition-all duration-300"
            >
              Ver produtos
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
            <Link
              to="/servicos"
              data-testid="hero-services-btn"
              className="inline-flex items-center gap-2 border border-earth text-earth px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-earth hover:text-canvas active:scale-95 transition-all duration-300"
            >
              Nossos serviços
            </Link>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 grid grid-cols-2 md:grid-cols-4 gap-10">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.1}>
              <p className="font-display font-black text-4xl md:text-5xl text-mist">{s.value}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-stone">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </section>

      <EditorialMarquee />

      {/* SERVICES BENTO */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32" data-testid="home-services">
        <Reveal>
          <p className="overline-label mb-4">O que fazemos</p>
          <h2 className="font-display font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl text-cream max-w-2xl">
            Sua máquina nunca para. <span className="font-serif italic font-medium text-earth">Nós também não.</span>
          </h2>
        </Reveal>
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          {SERVICES.slice(0, 3).map((s, i) => {
            const Icon = SERVICE_ICONS[i];
            return (
              <Reveal key={s.num} delay={i * 0.12}>
                <Link
                  to="/servicos"
                  data-testid={`home-service-card-${i}`}
                  className="group block bg-surface border border-white/5 hover:border-leaf/40 hover:-translate-y-1 transition-all duration-500"
                >
                  <div className="clip-corner h-56 overflow-hidden relative">
                    <img src={s.image} alt={s.title} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
                    <span className="absolute top-4 left-4 font-serif italic text-4xl text-earth/70">{s.num}</span>
                  </div>
                  <div className="p-8">
                    <Icon size={20} className="text-leaf-light mb-4" />
                    <h3 className="font-display font-bold text-2xl text-cream tracking-tight">{s.title}</h3>
                    <p className="mt-3 text-stone text-sm leading-relaxed">{s.desc}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-earth">
                      Saiba mais <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* PRODUCTS TEASER */}
      <section className="bg-surface/50 border-y border-white/5" data-testid="home-products">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
          <Reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="overline-label mb-4">Máquinas de ponta</p>
              <h2 className="font-display font-bold tracking-tight text-3xl sm:text-4xl md:text-5xl text-cream">
                Última geração,<br />pronta para a sua safra.
              </h2>
            </div>
            <Link
              to="/produtos"
              data-testid="home-all-products-btn"
              className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-mist hover:text-cream transition-colors"
            >
              Catálogo completo <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </Reveal>
          <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.12}>
                <div className="group bg-canvas border border-white/5 hover:border-earth/40 transition-colors duration-500" data-testid={`home-product-card-${p.id}`}>
                  <div className="clip-corner h-64 overflow-hidden relative">
                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[0.25em] text-mist/80">{p.category}</span>
                  </div>
                  <div className="p-7">
                    <h3 className="font-display font-bold text-xl text-cream tracking-tight">{p.name}</h3>
                    <p className="mt-2 text-stone text-sm leading-relaxed line-clamp-2">{p.description}</p>
                    <div className="mt-6">
                      <QuoteDialog product={p} testId={`home-quote-btn-${p.id}`} buttonClass="w-full justify-center" />
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO TEASER */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32" data-testid="home-manifesto">
        <Reveal>
          <p className="overline-label mb-4">Manifesto</p>
        </Reveal>
        <div className="grid md:grid-cols-3 gap-12 mt-8">
          {[
            { num: "01", title: "O campo não espera", text: "Cada hora de máquina parada é safra em risco. Trabalhamos com a urgência de quem entende o relógio da lavoura." },
            { num: "02", title: "Tecnologia a serviço da terra", text: "Ferramentas de diagnóstico de última geração e treinamento constante. Precisão de fábrica, no meio do campo." },
            { num: "03", title: "Palavra de fronteira", text: "De Uruguaiana para toda a fronteira oeste. Relação de confiança construída safra após safra, aperto de mão após aperto de mão." },
          ].map((c, i) => (
            <Reveal key={c.num} delay={i * 0.12}>
              <Link to="/sobre" className="group block" data-testid={`home-manifesto-${c.num}`}>
                <span className="font-serif italic text-6xl md:text-7xl text-earth/30 group-hover:text-earth/60 transition-colors duration-500">{c.num}</span>
                <h3 className="mt-4 font-display font-bold text-2xl text-cream tracking-tight">{c.title}</h3>
                <p className="mt-3 text-stone text-sm leading-relaxed">{c.text}</p>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/5" data-testid="home-cta">
        <img src={IMAGES.aerial} alt="Vista aérea de lavoura" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-canvas/85" />
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 py-24 md:py-32">
          <Reveal>
            <h2 className="font-display font-black tracking-tighter text-4xl sm:text-5xl md:text-6xl text-cream max-w-3xl leading-[0.95]">
              Máquina parada?<br />
              <span className="font-serif italic font-medium text-earth">A gente resolve.</span>
            </h2>
            <p className="mt-6 max-w-lg text-stone text-base md:text-lg font-light">
              Fale com a LG Industrial agora e receba atendimento especializado em Uruguaiana e toda a fronteira oeste.
            </p>
            <Link
              to="/contato"
              data-testid="home-cta-btn"
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
