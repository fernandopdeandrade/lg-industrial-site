import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { waLink } from "@/lib/constants";

export default function QuoteDialog({ product, buttonClass = "", testId }) {
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", message: "" });

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.post("/quotes", {
        name: form.name,
        phone: form.phone,
        product_id: product.id,
        product_name: product.name,
        message: form.message,
      });
      toast.success("Orçamento solicitado! Retornaremos em breve.");
      setOpen(false);
      setForm({ name: "", phone: "", message: "" });
    } catch (err) {
      toast.error("Não foi possível enviar. Tente pelo WhatsApp.");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          data-testid={testId}
          className={`group inline-flex items-center gap-2 bg-leaf text-cream px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-leaf-light active:scale-95 transition-all duration-300 ${buttonClass}`}
        >
          Solicitar Orçamento
          <Send size={13} className="group-hover:translate-x-1 transition-transform duration-300" />
        </button>
      </DialogTrigger>
      <DialogContent className="bg-surface border-white/10 text-cream max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-bold tracking-tight">
            Solicitar orçamento
          </DialogTitle>
          <p className="text-stone text-sm">
            Produto: <span className="text-mist">{product.name}</span>
          </p>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-5 mt-2" data-testid="quote-form">
          <input
            required
            minLength={2}
            placeholder="Seu nome"
            data-testid="quote-name-input"
            className="field-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            minLength={8}
            placeholder="Telefone / WhatsApp"
            data-testid="quote-phone-input"
            className="field-input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <textarea
            rows={3}
            placeholder="Mensagem (opcional)"
            data-testid="quote-message-input"
            className="field-input resize-none"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
          />
          <div className="flex flex-col gap-3 mt-1">
            <button
              type="submit"
              disabled={sending}
              data-testid="quote-submit-btn"
              className="bg-leaf text-cream px-6 py-4 text-xs font-bold uppercase tracking-widest hover:bg-leaf-light active:scale-95 transition-all duration-300 disabled:opacity-50"
            >
              {sending ? "Enviando..." : "Enviar solicitação"}
            </button>
            <a
              href={waLink(`Olá! Gostaria de solicitar um orçamento para: ${product.name}`)}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="quote-whatsapp-btn"
              className="inline-flex items-center justify-center gap-2 border border-earth text-earth px-6 py-4 text-xs font-bold uppercase tracking-widest hover:bg-earth hover:text-canvas transition-colors duration-300"
            >
              <MessageCircle size={14} /> Chamar no WhatsApp
            </a>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
