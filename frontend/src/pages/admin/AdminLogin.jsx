import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { formatApiError } from "@/lib/api";

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Bem-vindo ao painel.");
      navigate("/admin");
    } catch (err) {
      setError(formatApiError(err.response?.data?.detail));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-6" data-testid="admin-login-page">
      <div className="w-full max-w-sm bg-surface border border-white/10 p-10">
        <p className="font-display font-black text-2xl text-cream tracking-tight">
          LG<span className="text-earth">.</span>INDUSTRIAL
        </p>
        <p className="mt-2 text-stone text-sm">Painel administrativo</p>
        <form onSubmit={submit} className="mt-8 flex flex-col gap-6" data-testid="admin-login-form">
          <input
            type="email"
            required
            placeholder="E-mail"
            data-testid="admin-email-input"
            className="field-input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            required
            placeholder="Senha"
            data-testid="admin-password-input"
            className="field-input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && (
            <p className="text-destructive text-sm" data-testid="admin-login-error">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            data-testid="admin-login-submit"
            className="bg-leaf text-cream px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-leaf-light active:scale-95 transition-all duration-300 disabled:opacity-50"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
