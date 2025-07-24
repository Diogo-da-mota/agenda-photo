import { Routes, Route, Navigate } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import NotFound from "./pages/NotFound";

// Imports diretos para páginas críticas (evita React Error #31)
import Index from "./pages/Index";
import SystemInfo from "./pages/SystemInfo";
import SobreNos from "./pages/SobreNos";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Cookies from "./pages/Cookies";
import LGPD from "./pages/LGPD";
import Carreiras from "./pages/Carreiras";
import ReferralPage from "./pages/r/[code]";

// Import direto para componente de teste (temporário)
import { TesteBugCorrecao } from "./components/debug/TesteBugCorrecao";

// Lazy loading para componentes de portfólio
const PortfolioDesign = lazy(() => import("./pages/Dashboard/PortfolioDesign"));
const PortfolioIntegracoes = lazy(() => import("./pages/Dashboard/PortfolioIntegracoes"));
const PortfolioDominio = lazy(() => import("./pages/Dashboard/PortfolioDominio"));
const PortfolioNovo = lazy(() => import("./pages/Dashboard/PortfolioNovo"));
const PortfolioDetalhes = lazy(() => import("./pages/Dashboard/PortfolioDetalhes"));
const PortfolioGaleria = lazy(() => import("./pages/Dashboard/PortfolioGaleria"));
const PortfolioGaleriaTrabalho = lazy(() => import("./pages/Dashboard/PortfolioGaleriaTrabalho"));

// Lazy loading para componentes administrativos
const EscolherAlbum = lazy(() => import("./pages/Dashboard/EscolherAlbum"));
const DiagnosticoSupabase = lazy(() => import("./pages/Dashboard/DiagnosticoSupabase"));
const HistoricoAtividades = lazy(() => import("./pages/Dashboard/HistoricoAtividades"));

// Imports diretos apenas para componentes pequenos e críticos
import Indicacoes from "./pages/Dashboard/Indicacoes";
import Roadmap from "./pages/Dashboard/Roadmap";
import SimpleClientes from "./pages/Dashboard/SimpleClientes";
import Info from "./pages/Dashboard/Info";
import SupabaseUploadTest from "./components/testing/SupabaseUploadTest";
import DashboardLayout from "./layouts/DashboardLayout";

// Componente de Loading seguro e otimizado
const PageLoader = ({ message = "Carregando página..." }: { message?: string }) => (
  <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div>
    <div className="text-center space-y-2">
      <p className="text-sm font-medium text-foreground">{message}</p>
      <p className="text-xs text-muted-foreground">Aguarde um momento...</p>
    </div>
    {/* Skeleton para melhor UX */}
    <div className="w-full max-w-md space-y-2 mt-8">
      <div className="h-4 bg-muted rounded animate-pulse"></div>
      <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
      <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
    </div>
  </div>
);

// Error Boundary para lazy loading
class LazyLoadErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro no lazy loading:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-lg font-semibold text-destructive">Erro ao carregar página</h2>
            <p className="text-sm text-muted-foreground">Tente recarregar a página</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppRoutes = () => {
  return (
    <LazyLoadErrorBoundary>
      <Suspense fallback={<PageLoader message="Carregando página..." />}>
        <Routes>
        {/* Landing Page - Rota pública */}
        <Route path="/" element={<Index />} />
        
        {/* Rota de Indicação - Rota pública */}
        <Route path="/r/:code" element={<ReferralPage />} />
        
        {/* System Info - Rota pública */}
        <Route path="/funcionalidades" element={<SystemInfo />} />
        
        {/* Sobre Nós - Rota pública */}
        <Route path="/sobre-nos" element={<SobreNos />} />
        
        {/* Blog - Rota pública */}
        <Route path="/blog" element={<Blog />} />
        
        {/* Contato - Rota pública */}
        <Route path="/contact" element={<Contact />} />
        
        {/* Páginas Legais - Rotas públicas */}
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/cookies" element={<Cookies />} />
        <Route path="/lgpd" element={<LGPD />} />
        
        {/* Carreiras - Rota pública */}
        <Route path="/carreiras" element={<Carreiras />} />
        
        {/* ROTA TEMPORÁRIA - Teste de Correção do Bug */}
        <Route path="/teste-bug-templates" element={<TesteBugCorrecao />} />
        
        {/* Vitrine Pública do Portfólio */}
        <Route path="/portfolio/galeria" element={<PortfolioGaleria />} />
        <Route path="/portfolio/galeria/:id" element={<PortfolioGaleriaTrabalho />} />
        
        {/* Dashboard Routes - PROTEGIDAS */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<div>Dashboard - Em construção</div>} />
          <Route path="/clientes-simples" element={<SimpleClientes />} />
          <Route path="/indique-ganhe" element={<Indicacoes />} />
          <Route path="/indicacoes" element={<Navigate to="/indique-ganhe" replace />} />
          
          {/* Rota ADMIN ONLY - Roadmap */}
          <Route path="/roadmap" element={
            <AdminRoute>
              <Roadmap />
            </AdminRoute>
          } />
          
          <Route path="/atividades-linha-do-tempo" element={<HistoricoAtividades />} />
          <Route path="/dashboard/teste-supabase" element={<SupabaseUploadTest />} />
          <Route path="/info" element={<Info />} />
          
          {/* Novas rotas para Portfólio - PROTEGIDAS */}
          <Route path="/portfolio" element={<div>Portfólio - Em construção</div>} />
          <Route path="/portfolio/design" element={<PortfolioDesign />} />
          <Route path="/portfolio/integracoes" element={<PortfolioIntegracoes />} />
          <Route path="/portfolio/dominio" element={<PortfolioDominio />} />
          <Route path="/portfolio/novo" element={<PortfolioNovo />} />
          <Route path="/portfolio/:id" element={<PortfolioDetalhes />} />
          
          {/* Rota ADMIN ONLY - Escolher Album */}
          <Route path="/escolher-album" element={
            <AdminRoute>
              <EscolherAlbum />
            </AdminRoute>
          } />
          
          {/* Diagnóstico Supabase - PROTEGIDA */}
          <Route path="/diagnostico-supabase" element={<DiagnosticoSupabase />} />
        </Route>
        
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </LazyLoadErrorBoundary>
  );
};

export default AppRoutes;