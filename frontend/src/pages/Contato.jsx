import { MaskedLine, Reveal } from "@/components/Reveal";
import { api, formatApiError } from "@/lib/api";
import { COMPANY_CITY, COMPANY_EMAIL, waLink, WHATSAPP_DISPLAY } from "@/lib/constants";
import { Clock, Mail, MapPin, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Contato() {
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/contact", form);
      toast.success("Mensagem enviada! Retornaremos em breve.");
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      toast.error(formatApiError(err.response?.data?.detail));
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-testid="contato-page">
      <section className="max-w-7xl mx-auto px-6 md:px-12 pt-40 pb-24 md:pb-32 grid lg:grid-cols-2 gap-16 lg:gap-24">
        <div>
          <p className="overline-label mb-6">Contato</p>
          <h1 className="font-display font-black tracking-tighter leading-[0.92] text-5xl sm:text-6xl md:text-7xl text-cream" data-testid="contato-title">
            <MaskedLine delay={0.1}>VAMOS</MaskedLine>
            <MaskedLine delay={0.25}>
              <span className="font-serif italic font-medium text-earth">conversar.</span>
            </MaskedLine>
          </h1>
          <Reveal delay={0.4}>
            <p className="mt-8 max-w-md text-base md:text-lg text-stone font-light leading-relaxed">
              Orçamento, dúvida técnica ou emergência no campo — fale direto com a nossa equipe.
            </p>
            <div className="mt-12 flex flex-col gap-7">
              <a
                href={waLink("Olá! Vim pelo site da LG Industrial e gostaria de atendimento.")}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="contato-whatsapp-link"
                className="group flex items-start gap-4"
              >
                <span className="mt-1 p-3 border border-white/10 text-earth group-hover:border-earth transition-colors">
                  <MessageCircle size={18} />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-[0.2em] text-stone">WhatsApp</span>
                  <span className="block mt-1 text-cream text-lg group-hover:text-mist transition-colors">{WHATSAPP_DISPLAY}</span>
                </span>
              </a>
              <a href={`mailto:${COMPANY_EMAIL}`} data-testid="contato-email-link" className="group flex items-start gap-4">
                <span className="mt-1 p-3 border border-white/10 text-earth group-hover:border-earth transition-colors">
                  <Mail size={18} />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-[0.2em] text-stone">E-mail</span>
                  <span className="block mt-1 text-cream text-lg group-hover:text-mist transition-colors">{COMPANY_EMAIL}</span>
                </span>
              </a>
              <div className="flex items-start gap-4" data-testid="contato-address">
                <span className="mt-1 p-3 border border-white/10 text-earth">
                  <MapPin size={18} />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-[0.2em] text-stone">Onde estamos</span>
                  <span className="block mt-1 text-cream text-lg">{COMPANY_CITY}</span>
                </span>
              </div>
              <div className="flex items-start gap-4" data-testid="contato-hours">
                <span className="mt-1 p-3 border border-white/10 text-earth">
                  <Clock size={18} />
                </span>
                <span>
                  <span className="block text-xs uppercase tracking-[0.2em] text-stone">Horário</span>
                  <span className="block mt-1 text-cream text-lg">Seg–Sex 7h30–18h · Sáb 8h–12h</span>
                </span>
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={0.3} className="lg:pt-24">
          <form onSubmit={submit} className="bg-surface border border-white/5 p-8 md:p-12" data-testid="contact-form">
            <p className="overline-label mb-8">Envie uma mensagem</p>
            <div className="flex flex-col gap-6">
              <div>
                <label htmlFor="contact-name" className="text-xs uppercase tracking-[0.2em] text-stone">Nome</label>
                <input
                  id="contact-name"
                  required
                  minLength={2}
                  data-testid="contact-name-input"
                  className="field-input"
                  placeholder="Seu nome completo"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="contact-email" className="text-xs uppercase tracking-[0.2em] text-stone">E-mail</label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  data-testid="contact-email-input"
                  className="field-input"
                  placeholder="voce@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="contact-phone" className="text-xs uppercase tracking-[0.2em] text-stone">Telefone</label>
                <input
                  id="contact-phone"
                  data-testid="contact-phone-input"
                  className="field-input"
                  placeholder="(55) 9 9999-9999"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="text-xs uppercase tracking-[0.2em] text-stone">Mensagem</label>
                <textarea
                  id="contact-message"
                  required
                  minLength={5}
                  rows={4}
                  data-testid="contact-message-input"
                  className="field-input resize-none"
                  placeholder="Conte o que sua máquina precisa..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                data-testid="contact-submit-btn"
                className="group mt-2 inline-flex items-center justify-center gap-2 bg-leaf text-cream px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-leaf-light active:scale-95 transition-all duration-300 disabled:opacity-50"
              >
                {sending ? "Enviando..." : "Enviar mensagem"}
                <Send size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </form>
        </Reveal>
      </section>
      <section className="px-6 md:px-12 pb-24" aria-label="Localização da LG Industrial">
        <div className="relative mx-auto h-80 max-w-7xl overflow-hidden rounded-2xl border border-earth/70 bg-surface shadow-[0_28px_60px_rgba(0,0,0,0.72),0_0_0_1px_rgba(216, 110, 24, 0.55),0_0_48px_rgba(231, 113, 17, 0.4)] transition-shadow duration-500 hover:shadow-[0_36px_76px_rgba(0,0,0,0.8),0_0_0_1px_rgba(153,98,54,0.7),0_0_64px_rgba(153,98,54,0.55)] sm:h-96 lg:h-[32rem]">
          <iframe
            className="absolute inset-0 h-full w-full"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3463.4936280456172!2d-57.05215212375782!3d-29.763364875066287!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94535b1b9026e10f%3A0x9c55dd21746866c3!2sLG%20INDUSTRIAL%20METALURGICA!5e0!3m2!1spt-BR!2sbr!4v1790897091769!5m2!1spt-BR!2sbr"
            title="LG Industrial Metalúrgica no Google Maps"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
}
