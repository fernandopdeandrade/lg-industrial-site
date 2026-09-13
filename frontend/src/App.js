import "@/App.css";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import SmoothScroll from "@/components/SmoothScroll";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Servicos from "@/pages/Servicos";
import Produtos from "@/pages/Produtos";
import Sobre from "@/pages/Sobre";
import Politica from "@/pages/Politica";
import Contato from "@/pages/Contato";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import { Toaster } from "@/components/ui/sonner";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    if (window.__lenis) window.__lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (user === null) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center text-stone text-sm" data-testid="admin-loading">
        Verificando acesso...
      </div>
    );
  }
  if (user === false) return <Navigate to="/admin/login" replace />;
  return children;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <SmoothScroll>
          <ScrollToTop />
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/servicos" element={<Servicos />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/politica" element={<Politica />} />
              <Route path="/contato" element={<Contato />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster theme="dark" position="bottom-right" />
        </SmoothScroll>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
