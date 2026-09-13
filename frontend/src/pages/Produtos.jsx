import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Reveal, MaskedLine } from "@/components/Reveal";
import QuoteDialog from "@/components/QuoteDialog";

export default function Produtos() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/products")
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div data-testid="produtos-page">
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-16">
        <p className="overline-label mb-6">Produtos</p>
        <h1 className="font-display font-black tracking-tighter leading-[0.92] text-5xl sm:text-6xl md:text-7xl text-cream" data-testid="produtos-title">
          <MaskedLine delay={0.1}>MÁQUINAS DE</MaskedLine>
          <MaskedLine delay={0.25}>
            <span className="font-serif italic font-medium text-earth">última geração.</span>
          </MaskedLine>
        </h1>
        <Reveal delay={0.4}>
          <p className="mt-8 max-w-xl text-base md:text-lg text-stone font-light leading-relaxed">
            Trabalhamos com equipamentos e ferramentas das melhores linhas do mercado.
            Solicite um orçamento e nossa equipe retorna rapidamente.
          </p>
        </Reveal>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 md:pb-32">
        {loading ? (
          <div className="py-24 text-center text-stone" data-testid="produtos-loading">Carregando catálogo...</div>
        ) : products.length === 0 ? (
          <div className="py-24 text-center text-stone" data-testid="produtos-empty">
            Nenhum produto cadastrado no momento. Fale conosco para mais informações.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <Reveal key={p.id} delay={(i % 3) * 0.1}>
                <article
                  className="group bg-surface border border-white/5 hover:border-earth/40 transition-colors duration-500 h-full flex flex-col"
                  data-testid={`product-card-${p.id}`}
                >
                  <div className="clip-corner h-64 overflow-hidden relative">
                    <img
                      src={p.image_url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[0.25em] text-mist/80">
                      {p.category}
                    </span>
                  </div>
                  <div className="p-7 flex flex-col flex-1">
                    <h2 className="font-display font-bold text-xl text-cream tracking-tight">{p.name}</h2>
                    <p className="mt-2 text-stone text-sm leading-relaxed flex-1">{p.description}</p>
                    <div className="mt-6">
                      <QuoteDialog product={p} testId={`product-quote-btn-${p.id}`} buttonClass="w-full justify-center" />
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
