import { COMPANY_CITY, COMPANY_EMAIL, NAV_LINKS, waLink, WHATSAPP_DISPLAY } from "@/lib/constants";
import { Mail, MapPin, Menu, MessageCircle, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-canvas/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 h-20 flex items-center justify-between">
        <Link
          to="/"
          data-testid="nav-logo"
          className="font-display font-black text-xl tracking-tight text-cream"
        >
          LG<span className="text-earth">.</span>INDUSTRIAL
        </Link>
        <nav className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={l.testId}
              className={({ isActive }) =>
                `text-xs font-bold uppercase tracking-[0.18em] transition-colors duration-300 ${
                  isActive ? "text-mist" : "text-stone hover:text-cream"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <a
          href={waLink("Olá! Vim pelo site da LG Industrial e gostaria de atendimento.")}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="nav-whatsapp-btn"
          className="hidden lg:inline-flex items-center gap-2 border border-earth text-earth px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-earth hover:text-canvas transition-colors duration-300"
        >
          <MessageCircle size={14} /> WhatsApp
        </a>
        <button
          className="lg:hidden text-cream"
          data-testid="nav-menu-toggle"
          onClick={() => setOpen(!open)}
          aria-label="Abrir menu"
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>
      {open && (
        <nav className="lg:hidden bg-canvas/95 backdrop-blur-xl border-t border-white/5 px-6 py-6 flex flex-col gap-5">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              data-testid={`mobile-${l.testId}`}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `text-sm font-bold uppercase tracking-[0.18em] ${isActive ? "text-mist" : "text-stone"}`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <a
            href={waLink("Olá! Vim pelo site da LG Industrial e gostaria de atendimento.")}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="mobile-nav-whatsapp-btn"
            className="inline-flex items-center gap-2 border border-earth text-earth px-6 py-3 text-xs font-bold uppercase tracking-widest w-fit"
          >
            <MessageCircle size={14} /> WhatsApp
          </a>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/5 bg-canvas" data-testid="site-footer">
      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-10">
        <div className="grid md:grid-cols-3 gap-12 mb-20">
          <div>
            <p className="overline-label mb-4">Contato</p>
            <a
              href={waLink("Olá! Vim pelo site da LG Industrial.")}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-whatsapp-link"
              className="flex items-center gap-3 text-cream hover:text-mist transition-colors py-1"
            >
              <MessageCircle size={16} className="text-earth" /> {WHATSAPP_DISPLAY}
            </a>
            <a
              href={`mailto:${COMPANY_EMAIL}`}
              data-testid="footer-email-link"
              className="flex items-center gap-3 text-cream hover:text-mist transition-colors py-1"
            >
              <Mail size={16} className="text-earth" /> {COMPANY_EMAIL}
            </a>
            <p className="flex items-center gap-3 text-stone py-1">
              <MapPin size={16} className="text-earth" /> {COMPANY_CITY}
            </p>
          </div>
          <div>
            <p className="overline-label mb-4">Navegação</p>
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  data-testid={`footer-${l.testId}`}
                  className="text-stone hover:text-cream transition-colors text-sm"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <p className="overline-label mb-4">Atendimento</p>
            <p className="text-stone text-sm leading-relaxed">
              Segunda a sexta, 7h30 às 18h.
              <br />
              Sábado, 8h às 12h.
              <br />
              Atendimento em campo em toda a fronteira oeste do RS.
            </p>
          </div>
        </div>
        <div
          className="font-display font-black leading-none text-cream/5 select-none whitespace-nowrap overflow-hidden text-[16vw]"
          aria-hidden="true"
        >
          LG INDUSTRIAL
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-8 border-t border-white/5 mt-4">
          <p className="text-stone text-xs">© 2026 LG Industrial. Todos os direitos reservados. "Desenvolvido por Fernando Pereira de Andrade"</p>
          <Link to="/admin/login" data-testid="footer-admin-link" className="text-stone/50 text-xs hover:text-stone transition-colors">
            Área restrita
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="min-h-screen bg-canvas text-cream">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
