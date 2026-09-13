export const WHATSAPP_NUMBER = "5555997211650";
export const WHATSAPP_DISPLAY = "(55) 99721-1650";
export const COMPANY_EMAIL = "pupygreen@gmail.com";
export const COMPANY_CITY = "Uruguaiana, Rio Grande do Sul";

export const waLink = (text) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export const IMAGES = {
  heroTractor:
    "https://images.unsplash.com/photo-1717702576954-c07131c54169?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNDR8MHwxfHNlYXJjaHwzfHxkcm9uZSUyMHZpZXclMjBncmVlbiUyMGZhcm0lMjBmaWVsZHMlMjB0cmFjdG9yfGVufDB8fHx8MTc4NzQ0OTg4Mnww&ixlib=rb-4.1.0&q=85",
  aerial:
    "https://images.pexels.com/photos/37314899/pexels-photo-37314899.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  harvester:
    "https://images.pexels.com/photos/38952133/pexels-photo-38952133.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  wheel:
    "https://images.unsplash.com/photo-1594691592645-3f8351f04e84?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxhZ3JpY3VsdHVyYWwlMjBtYWNoaW5lcnklMjBjbG9zZSUyMHVwfGVufDB8fHx8MTc4NzQ0OTg4Mnww&ixlib=rb-4.1.0&q=85",
  repair:
    "https://images.pexels.com/photos/33388413/pexels-photo-33388413.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
  mechanic:
    "https://images.unsplash.com/photo-1615906655593-ad0386982a0f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzR8MHwxfHNlYXJjaHwxfHxtZWNoYW5pYyUyMGRpYWdub3NpbmclMjBpbmR1c3RyaWFsJTIwZXF1aXBtZW50fGVufDB8fHx8MTc4NzQ0OTg4Mnww&ixlib=rb-4.1.0&q=85",
  gears:
    "https://images.pexels.com/photos/21854070/pexels-photo-21854070.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
};

export const NAV_LINKS = [
  { to: "/", label: "Início", testId: "nav-link-home" },
  { to: "/servicos", label: "Serviços", testId: "nav-link-servicos" },
  { to: "/produtos", label: "Produtos", testId: "nav-link-produtos" },
  { to: "/sobre", label: "Sobre", testId: "nav-link-sobre" },
  { to: "/politica", label: "Política", testId: "nav-link-politica" },
  { to: "/contato", label: "Contato", testId: "nav-link-contato" },
];

export const SERVICES = [
  {
    num: "01",
    title: "Diagnóstico Eletrônico",
    desc: "Scanners multimarca de última geração leem falhas, sensores e telemetria em minutos — sem achismo, direto na causa raiz.",
    image: IMAGES.mechanic,
  },
  {
    num: "02",
    title: "Manutenção Preventiva",
    desc: "Planos sob medida por horas de operação. Troca de filtros, lubrificação e calibração antes que a falha aconteça.",
    image: IMAGES.repair,
  },
  {
    num: "03",
    title: "Manutenção Corretiva",
    desc: "Motor, transmissão, hidráulica e elétrica embarcada. Reparo com peças de procedência e garantia de serviço.",
    image: IMAGES.gears,
  },
  {
    num: "04",
    title: "Atendimento em Campo",
    desc: "Unidade móvel equipada vai até a sua propriedade. Menos máquina parada, mais safra no prazo.",
    image: IMAGES.heroTractor,
  },
  {
    num: "05",
    title: "Peças e Componentes",
    desc: "Estoque de peças originais e homologadas para tratores, colheitadeiras, plantadeiras e pulverizadores.",
    image: IMAGES.wheel,
  },
  {
    num: "06",
    title: "Retrofit e Modernização",
    desc: "Atualizamos máquinas consolidadas com telemetria, piloto automático e eletrônica embarcada de nova geração.",
    image: IMAGES.aerial,
  },
];
