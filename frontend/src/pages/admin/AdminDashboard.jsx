import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, ExternalLink, Plus, Pencil, Trash2, Check, Inbox } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const emptyProduct = { name: "", category: "", description: "", image_url: "", featured: false };

function ProductForm({ initial, onSaved }) {
  const [form, setForm] = useState(initial || emptyProduct);
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial?.id) {
        await api.put(`/admin/products/${initial.id}`, form);
      } else {
        await api.post("/admin/products", form);
      }
      toast.success(initial?.id ? "Produto atualizado." : "Produto criado.");
      onSaved();
    } catch (err) {
      toast.error("Erro ao salvar produto.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 mt-2" data-testid="product-form">
      <input required minLength={2} placeholder="Nome do produto" data-testid="product-name-input" className="field-input"
        value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <input required minLength={2} placeholder="Categoria (ex: Colheita)" data-testid="product-category-input" className="field-input"
        value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
      <textarea required minLength={5} rows={3} placeholder="Descrição" data-testid="product-description-input" className="field-input resize-none"
        value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      <input required minLength={5} placeholder="URL da imagem" data-testid="product-image-input" className="field-input"
        value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
      <label className="flex items-center gap-3 text-sm text-stone cursor-pointer">
        <input type="checkbox" data-testid="product-featured-input" className="accent-[#4A6E46] w-4 h-4"
          checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
        Destacar na página inicial
      </label>
      <button type="submit" disabled={saving} data-testid="product-save-btn"
        className="bg-leaf text-cream px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-leaf-light transition-colors disabled:opacity-50">
        {saving ? "Salvando..." : "Salvar produto"}
      </button>
    </form>
  );
}

function ProductsTab() {
  const [products, setProducts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = useCallback(() => {
    api.get("/products").then((r) => setProducts(r.data)).catch(() => toast.error("Erro ao carregar produtos."));
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async (p) => {
    if (!window.confirm(`Excluir "${p.name}"?`)) return;
    await api.delete(`/admin/products/${p.id}`);
    toast.success("Produto excluído.");
    load();
  };

  return (
    <div data-testid="admin-products-tab">
      <div className="flex items-center justify-between mb-6">
        <p className="text-stone text-sm">{products.length} produto(s) cadastrado(s)</p>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <button data-testid="product-new-btn" onClick={() => setEditing(null)}
              className="inline-flex items-center gap-2 bg-leaf text-cream px-5 py-3 text-xs font-bold uppercase tracking-widest hover:bg-leaf-light transition-colors">
              <Plus size={14} /> Novo produto
            </button>
          </DialogTrigger>
          <DialogContent className="bg-surface border-white/10 text-cream max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">{editing ? "Editar produto" : "Novo produto"}</DialogTitle>
            </DialogHeader>
            <ProductForm initial={editing} onSaved={() => { setDialogOpen(false); setEditing(null); load(); }} />
          </DialogContent>
        </Dialog>
      </div>
      <div className="border border-white/10 divide-y divide-white/5">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-4 bg-surface/50" data-testid={`admin-product-row-${p.id}`}>
            <img src={p.image_url} alt="" className="w-16 h-12 object-cover clip-corner shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-cream font-semibold truncate">{p.name}</p>
              <p className="text-stone text-xs">{p.category}{p.featured ? " · Destaque" : ""}</p>
            </div>
            <button data-testid={`admin-product-edit-${p.id}`} onClick={() => { setEditing(p); setDialogOpen(true); }}
              className="p-2 text-stone hover:text-mist transition-colors" aria-label="Editar">
              <Pencil size={16} />
            </button>
            <button data-testid={`admin-product-delete-${p.id}`} onClick={() => remove(p)}
              className="p-2 text-stone hover:text-destructive transition-colors" aria-label="Excluir">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        {products.length === 0 && <p className="p-8 text-center text-stone text-sm">Nenhum produto cadastrado.</p>}
      </div>
    </div>
  );
}

function InboxTab({ endpoint, type }) {
  const [items, setItems] = useState([]);

  const load = useCallback(() => {
    api.get(`/admin/${endpoint}`).then((r) => setItems(r.data)).catch(() => {});
  }, [endpoint]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (item) => {
    await api.patch(`/admin/${endpoint}/${item.id}/read`);
    load();
  };

  const remove = async (item) => {
    if (!window.confirm("Excluir este registro?")) return;
    await api.delete(`/admin/${endpoint}/${item.id}`);
    load();
  };

  return (
    <div data-testid={`admin-${endpoint}-tab`}>
      {items.length === 0 ? (
        <div className="border border-white/10 p-12 text-center text-stone">
          <Inbox size={28} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Nenhum registro por aqui ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} data-testid={`admin-${endpoint}-row-${item.id}`}
              className={`border p-5 flex flex-col gap-2 ${item.read ? "border-white/5 bg-surface/40 opacity-70" : "border-earth/30 bg-surface"}`}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-cream font-semibold">
                  {item.name}
                  {type === "quote" && <span className="text-earth font-normal"> — {item.product_name}</span>}
                </p>
                <p className="text-stone text-xs">{new Date(item.created_at).toLocaleString("pt-BR")}</p>
              </div>
              <p className="text-stone text-sm">
                {item.email && <span className="mr-4">{item.email}</span>}
                {item.phone && <span>{item.phone}</span>}
              </p>
              {item.message && <p className="text-cream/80 text-sm leading-relaxed">{item.message}</p>}
              <div className="flex gap-3 mt-1">
                {!item.read && (
                  <button data-testid={`admin-${endpoint}-read-${item.id}`} onClick={() => markRead(item)}
                    className="inline-flex items-center gap-1 text-xs text-mist hover:text-cream transition-colors">
                    <Check size={13} /> Marcar como lida
                  </button>
                )}
                <button data-testid={`admin-${endpoint}-delete-${item.id}`} onClick={() => remove(item)}
                  className="inline-flex items-center gap-1 text-xs text-stone hover:text-destructive transition-colors">
                  <Trash2 size={13} /> Excluir
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-canvas" data-testid="admin-dashboard">
      <header className="border-b border-white/10 bg-surface/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <p className="font-display font-black text-lg text-cream tracking-tight">
            LG<span className="text-earth">.</span>PAINEL
          </p>
          <div className="flex items-center gap-4">
            <Link to="/" data-testid="admin-view-site-link" className="inline-flex items-center gap-1 text-xs text-stone hover:text-cream transition-colors">
              <ExternalLink size={13} /> Ver site
            </Link>
            <span className="text-stone text-xs hidden sm:inline">{user?.email}</span>
            <button data-testid="admin-logout-btn" onClick={logout}
              className="inline-flex items-center gap-1 text-xs text-stone hover:text-destructive transition-colors">
              <LogOut size={13} /> Sair
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-display font-bold text-3xl text-cream tracking-tight mb-8">Gerenciamento</h1>
        <Tabs defaultValue="produtos">
          <TabsList className="bg-surface border border-white/10 mb-8">
            <TabsTrigger value="produtos" data-testid="admin-tab-produtos">Produtos</TabsTrigger>
            <TabsTrigger value="mensagens" data-testid="admin-tab-mensagens">Mensagens</TabsTrigger>
            <TabsTrigger value="orcamentos" data-testid="admin-tab-orcamentos">Orçamentos</TabsTrigger>
          </TabsList>
          <TabsContent value="produtos"><ProductsTab /></TabsContent>
          <TabsContent value="mensagens"><InboxTab endpoint="messages" type="message" /></TabsContent>
          <TabsContent value="orcamentos"><InboxTab endpoint="quotes" type="quote" /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
