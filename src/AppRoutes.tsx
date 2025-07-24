import { Routes, Route, Navigate } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import NotFound from "./pages/NotFound";
import { useLazyLoading, useNetworkAwareLoading } from "./hooks/useLazyLoading";

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

// Lazy loading para componentes principais (otimização de performance)
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Portfolio = lazy(() => import("./pages/Dashboard/Portfolio"));
const Financeiro = lazy(() => import("./pages/Dashboard/Financeiro"));
const Agenda = lazy(() => import("./pages/Dashboard/Agenda"));
const Clientes = lazy(() => import("./pages/Dashboard/Clientes"));
const Configuracoes = lazy(() => import("./pages/Dashboard/Configuracoes"));
const Contratos = lazy(() => import("./pages/Dashboard/Contratos"));
const ContractDetails = lazy(() => import("./pages/Dashboard/ContractDetails"));
const HistoricoAtividades = lazy(() => import("./pages/Dashboard/HistoricoAtividades"));
const Reports = lazy(() => import("./pages/Dashboard/Reports"));
const Mensagens = lazy(() => import("./pages/Dashboard/Mensagens"));

// Lazy loading para componentes de portfólio
const PortfolioDesign = lazy(() => import("./pages/Dashboard/PortfolioDesign"));
const PortfolioIntegracoes = lazy(() => import("./pages/Dashboard/PortfolioIntegracoes"));
const PortfolioDominio = lazy(() => import("./pages/Dashboard/PortfolioDominio"));
const PortfolioNovo = lazy(() => import("./pages/Dashboard/PortfolioNovo"));
const PortfolioDetalhes = lazy(() => import("./pages/Dashboard/PortfolioDetalhes"));
const PortfolioGaleria = lazy(() => import("./pages/Dashboard/PortfolioGaleria"));
const PortfolioGaleriaTrabalho = lazy(() => import("./pages/Dashboard/PortfolioGaleriaTrabalho"));

// Lazy loading para componentes administrativos
const EntregaFotos = lazy(() => import("./pages/Dashboard/EntregaFotos"));
const EntregaFotosAdmin = lazy(() => import("./components/dashboard/EntregaFotosAdmin"));
const EntregaFotosVisualizacao = lazy(() => import("./pages/EntregaFotosVisualizacao"));
const EscolherAlbum = lazy(() => import("./pages/Dashboard/EscolherAlbum"));

// Lazy loading para área do cliente
const ClientAgenda = lazy(() => import("./pages/Client/ClientAgenda"));
const ClientQuote = lazy(() => import("./pages/Client/ClientQuote"));
const ClientContract = lazy(() => import("./pages/Client/ClientContract"));
const ClientNotifications = lazy(() => import("./pages/Client/ClientNotifications"));

// Imports diretos apenas para componentes pequenos e críticos
import Indicacoes from "./pages/Dashboard/Indicacoes";
import Roadmap from "./pages/Dashboard/Roadmap";
import SimpleClientes from "./pages/Dashboard/SimpleClientes";
import Testes from "./pages/Dashboard/Testes";
import Info from "./pages/Dashboard/Info";
import DashboardLayout from "./layouts/DashboardLayout";
import ClientLayout from "./layouts/ClientLayout";
import AgendaLayout from "./layouts/AgendaLayout";
import ClientTabLayout from "./layouts/ClientTabLayout";

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
  // Hooks para lazy loading inteligente
  const { currentPath } = useLazyLoading();
  const { connectionSpeed, shouldPreload, loadingStrategy } = useNetworkAwareLoading();

  // Ajusta a mensagem de loading baseado na conexão
  const getLoadingMessage = () => {
    switch (connectionSpeed) {
      case 'slow':
        return 'Carregando (conexão lenta)...';
      case 'medium':
        return 'Carregando página...';
      case 'fast':
        return 'Carregando rapidamente...';
      default:
        return 'Carregando página...';
    }
  };

  return (
    <LazyLoadErrorBoundary>
      <Suspense fallback={<PageLoader message={getLoadingMessage()} />}>
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
        
        {/* Vitrine Pública do Portfólio */}
        <Route path="/portfolio/galeria" element={<PortfolioGaleria />} />
        <Route path="/portfolio/galeria/:id" element={<PortfolioGaleriaTrabalho />} />
        
        {/* Visualização Pública de Galeria de Fotos */}
        <Route path="/entrega-fotos/:slug" element={<EntregaFotosVisualizacao />} />
        
        {/* Visualização Pública de Contrato - SEM layout do site */}
        {/* Rota unificada que suporta tanto slug quanto ID direto */}
        <Route path="/contrato/:slug" element={<ClientContract />} />
        
        {/* Rota Agenda com layout específico sem cabeçalho */}
        <Route path="/agenda" element={
          <ProtectedRoute>
            <AgendaLayout>
              <Agenda />
            </AgendaLayout>
          </ProtectedRoute>
        } />
                {/* Nova rota para agenda do cliente - Acesso direto sem autenticação */}
        <Route path="/agenda/cliente" element={<ClientAgenda />} />
        
        {/* Dashboard Routes - PROTEGIDAS */}
        <Route element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/clientes-simples" element={<SimpleClientes />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/indique-ganhe" element={<Indicacoes />} />
          <Route path="/indicacoes" element={<Navigate to="/indique-ganhe" replace />} />
          
          {/* Rota ADMIN ONLY - Roadmap */}
          <Route path="/roadmap" element={
            <AdminRoute>
              <Roadmap />
            </AdminRoute>
          } />
          
          <Route path="/configuracoes" element={<Navigate to="/configuracoes-empresa" replace />} />
          {/* Rotas amigáveis para seções de configurações */}
          <Route path="/configuracoes-empresa" element={<Configuracoes />} />
          <Route path="/configuracoes-preferencias" element={<Configuracoes />} />
          <Route path="/configuracoes-integracoes" element={<Configuracoes />} />
          <Route path="/configuracoes-imagens" element={<Configuracoes />} />
          <Route path="/configuracoes-seguranca" element={<Configuracoes />} />
          
          {/* Rota Mensagens - Acessível para todos */}
          <Route path="/mensagens" element={<Mensagens />} />

          {/* Rota Contratos - Acessível para todos */}
          <Route path="/contratos" element={<Contratos />} />
          
          {/* Rota Detalhes do Contrato - Acessível para todos */}
          {/* Rota unificada que suporta tanto slug quanto ID direto */}
          <Route path="/contratos/:slug" element={<ContractDetails />} />
          
          <Route path="/atividades" element={<Navigate to="/atividades-linha-do-tempo" replace />} />
          <Route path="/atividades-linha-do-tempo" element={<HistoricoAtividades />} />
          <Route path="/atividades-notificacoes" element={<HistoricoAtividades />} />
          <Route path="/atividades-filtros" element={<HistoricoAtividades />} />
          <Route path="/relatorios" element={<Reports />} />
          <Route path="/dashboard/testes" element={<Testes />} />
          <Route path="/info" element={<Info />} />
          
          {/* Novas rotas para Portfólio - PROTEGIDAS */}
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/portfolio/design" element={<PortfolioDesign />} />
          <Route path="/portfolio/integracoes" element={<PortfolioIntegracoes />} />
          <Route path="/portfolio/dominio" element={<PortfolioDominio />} />
          
          {/* Rota ADMIN ONLY - Entrega de Fotos */}
          <Route path="/entrega-fotos" element={
            <AdminRoute>
              <EntregaFotos />
            </AdminRoute>
          } />
          
          {/* Rota ADMIN ONLY - Administração Entrega de Fotos */}
          <Route path="/entrega-fotos/admin" element={
            <AdminRoute>
              <EntregaFotosAdmin />
            </AdminRoute>
          } />
          
          {/* Rota ADMIN ONLY - Escolher Album */}
          <Route path="/escolher-album" element={
            <AdminRoute>
              <EscolherAlbum />
            </AdminRoute>
          } />
          
          <Route path="/portfolio/novo" element={<PortfolioNovo />} />
          <Route path="/portfolio/:id" element={<PortfolioDetalhes />} />
          
          {/* Client Portal Routes - ADMIN ONLY - Com navegação por abas */}
          <Route path="/cliente/agenda" element={
            <AdminRoute>
              <ClientTabLayout>
                <ClientAgenda />
              </ClientTabLayout>
            </AdminRoute>
          } />
          <Route path="/cliente/orcamento" element={
            <AdminRoute>
              <ClientTabLayout>
                <ClientQuote />
              </ClientTabLayout>
            </AdminRoute>
          } />
          {/* Rota unificada que suporta tanto slug quanto ID direto */}
          <Route path="/cliente/contrato/:slug" element={
            <AdminRoute>
              <ClientTabLayout>
                <ClientContract />
              </ClientTabLayout>
            </AdminRoute>
          } />
          <Route path="/cliente/notificacoes" element={
            <AdminRoute>
              <ClientTabLayout>
                <ClientNotifications />
              </ClientTabLayout>
            </AdminRoute>
          } />
        </Route>
        
          {/* Fallback route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </LazyLoadErrorBoundary>
  );
};

export default AppRoutes;
