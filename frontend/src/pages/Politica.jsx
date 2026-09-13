import { Reveal, MaskedLine } from "@/components/Reveal";

const SECTIONS = [
  {
    num: "01",
    title: "Política de Qualidade",
    text: "A LG Industrial compromete-se a executar todos os serviços de manutenção seguindo os manuais técnicos dos fabricantes, utilizando peças originais ou homologadas e ferramentas calibradas. Todo serviço entregue possui garantia e registro de ordem de serviço.",
  },
  {
    num: "02",
    title: "Ética e Transparência",
    text: "Orçamentos são apresentados de forma clara e detalhada antes de qualquer intervenção. Nenhum serviço adicional é executado sem autorização expressa do cliente. Não praticamos preços diferenciados por desconhecimento técnico do cliente.",
  },
  {
    num: "03",
    title: "Segurança do Trabalho",
    text: "Nossa equipe atua em conformidade com as normas regulamentadoras aplicáveis (NR-11, NR-12 e NR-35), com uso obrigatório de EPIs, bloqueio e etiquetagem de máquinas em manutenção e treinamento periódico de segurança.",
  },
  {
    num: "04",
    title: "Responsabilidade Ambiental",
    text: "Óleos, filtros, lubrificantes e resíduos contaminados são destinados a empresas licenciadas, com comprovação. Nenhum resíduo é descartado no solo ou em cursos d'água. Buscamos continuamente processos mais limpos na oficina e no atendimento em campo.",
  },
  {
    num: "05",
    title: "Privacidade e Proteção de Dados (LGPD)",
    text: "Os dados fornecidos por meio do site (nome, e-mail, telefone e mensagens) são utilizados exclusivamente para responder às solicitações de contato e orçamento. Não vendemos, compartilhamos ou utilizamos seus dados para outros fins. Você pode solicitar a exclusão dos seus dados a qualquer momento pelo e-mail pupygreen@gmail.com.",
  },
  {
    num: "06",
    title: "Relacionamento com o Cliente",
    text: "Atendemos com pontualidade e respeito, na oficina ou no campo. Em caso de divergência sobre qualquer serviço, o cliente tem canal direto com a direção da empresa para resolução rápida e justa.",
  },
];

export default function Politica() {
  return (
    <div data-testid="politica-page">
      <section className="max-w-3xl mx-auto px-6 pt-40 pb-16">
        <p className="overline-label mb-6">Política da empresa</p>
        <h1 className="font-display font-black tracking-tighter leading-[0.92] text-5xl sm:text-6xl md:text-7xl text-cream" data-testid="politica-title">
          <MaskedLine delay={0.1}>NOSSOS</MaskedLine>
          <MaskedLine delay={0.25}>
            <span className="font-serif italic font-medium text-earth">compromissos.</span>
          </MaskedLine>
        </h1>
        <Reveal delay={0.4}>
          <p className="mt-8 text-base md:text-lg text-stone font-light leading-relaxed">
            A política da LG Industrial orienta cada atendimento, cada orçamento e cada parafuso apertado.
            Última atualização: janeiro de 2026.
          </p>
        </Reveal>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24 md:pb-32">
        <div className="divide-y divide-white/5 border-y border-white/5">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.num} delay={i * 0.04}>
              <article className="py-12 grid sm:grid-cols-[auto_1fr] gap-6 items-start" data-testid={`politica-section-${s.num}`}>
                <span className="font-serif italic text-5xl text-earth/30 leading-none">{s.num}</span>
                <div>
                  <h2 className="font-display font-bold tracking-tight text-2xl text-cream">{s.title}</h2>
                  <p className="mt-4 text-stone text-base leading-relaxed">{s.text}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
