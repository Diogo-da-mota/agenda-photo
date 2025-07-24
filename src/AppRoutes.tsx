import { Routes, Route, Navigate } from "react-router-dom";
import React, { lazy, Suspense } from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import NotFound from "./pages/NotFound";

// ========================================
// IMPORTS DIRETOS - PÁGINAS CRÍTICAS
// ========================================
// Páginas públicas carregadas diretamente para melhor performance
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

// Componentes pequenos e críticos
import Indicacoes from "./pages/Dashboard/Indicacoes";
import Roadmap from "./pages/Dashboard/Roadmap";
import SimpleClientes from "./pages/Dashboard/SimpleClientes";
import Testes from "./pages/Dashboard/Testes";
import Info from "./pages/Dashboard/Info";
import SupabaseUploadTest from "./components/testing/SupabaseUploadTest";

// Layouts
import DashboardLayout from "./layouts/DashboardLayout";
import ClientLayout from "./layouts/ClientLayout";
import AgendaLayout from "./layouts/AgendaLayout";
import ClientTabLayout from "./layouts/ClientTabLayout";

// Componente de teste temporário
import { TesteBugCorrecao } from "./components/debug/TesteBugCorrecao";

// ========================================
// LAZY LOADING - DASHBOARD PRINCIPAL
// ========================================
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Agenda = lazy(() => import("./pages/Dashboard/Agenda"));
const Clientes = lazy(() => import("./pages/Dashboard/Clientes"));
const Financeiro = lazy(() => import("./pages/Dashboard/Financeiro"));
const Mensagens = lazy(() => import("./pages/Dashboard/Mensagens"));
const Contratos = lazy(() => import("./pages/Dashboard/Contratos"));
const ContractDetails = lazy(() => import("./pages/Dashboard/ContractDetails"));
const Configuracoes = lazy(() => import("./pages/Dashboard/Configuracoes"));

// ========================================
// LAZY LOADING - PORTFÓLIO
// ========================================
const Portfolio = lazy(() => import("./pages/Dashboard/Portfolio"));
const PortfolioNovo = lazy(() => import("./pages/Dashboard/PortfolioNovo"));
const PortfolioDetalhes = lazy(() => import("./pages/Dashboard/PortfolioDetalhes"));
const PortfolioDesign = lazy(() => import("./pages/Dashboard/PortfolioDesign"));
const PortfolioIntegracoes = lazy(() => import("./pages/Dashboard/PortfolioIntegracoes"));
const PortfolioDominio = lazy(() => import("./pages/Dashboard/PortfolioDominio"));
const PortfolioGaleria = lazy(() => import("./pages/Dashboard/PortfolioGaleria"));
const PortfolioGaleriaTrabalho = lazy(() => import("./pages/Dashboard/PortfolioGaleriaTrabalho"));

// ========================================
// LAZY LOADING - RELATÓRIOS E ATIVIDADES
// ========================================
const Reports = lazy(() => import("./pages/Dashboard/Reports"));
const HistoricoAtividades = lazy(() => import("./pages/Dashboard/HistoricoAtividades"));

// ========================================
// LAZY LOADING - ADMINISTRATIVO
// ========================================
const EntregaFotos = lazy(() => import("./pages/Dashboard/EntregaFotos"));
const EntregaFotosAdmin = lazy(() => import("./components/Dashboard/EntregaFotosAdmin"));
const EntregaFotosVisualizacao = lazy(() => import("./pages/EntregaFotosVisualizacao"));
const EscolherAlbum = lazy(() => import("./pages/Dashboard/EscolherAlbum"));
const DiagnosticoSupabase = lazy(() => import("./pages/Dashboard/DiagnosticoSupabase"));

// ========================================
// LAZY LOADING - PORTAL DO CLIENTE
// ========================================
const ClientDashboard = lazy(() => import("./pages/Client/ClientDashboard"));
const ClientAgenda = lazy(() => import("./pages/Client/ClientAgenda"));
const ClientPayments = lazy(() => import("./pages/Client/ClientPayments"));
const ClientQuote = lazy(() => import("./pages/Client/ClientQuote"));
const ClientContract = lazy(() => import("./pages/Client/ClientContract"));
const ClientContracts = lazy(() => import("./pages/Client/ClientContracts"));
const ClientNotifications = lazy(() => import("./pages/Client/ClientNotifications"));

// ========================================
// COMPONENTES DE LOADING E ERROR HANDLING
// ========================================

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

// ========================================
// COMPONENTE PRINCIPAL DE ROTAS
// ========================================

const AppRoutes = () => {
  // Simple connection speed detection (fallback implementation)
  const getConnectionSpeed = () => {
    // @ts-ignore - navigator.connection is experimental
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return 'medium';
    
    const effectiveType = connection.effectiveType;
    if (effectiveType === 'slow-2g' || effectiveType === '2g') return 'slow';
    if (effectiveType === '3g') return 'medium';
    return 'fast';
  };

  const connectionSpeed = getConnectionSpeed();

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
          
          {/* ========================================
              ROTAS PÚBLICAS (SEM AUTENTICAÇÃO)
              ======================================== */}
          
          {/* Landing Page */}
          <Route path="/" element={<Index />} />
          
          {/* Páginas Institucionais */}
          <Route path="/funcionalidades" element={<SystemInfo />} />
          <Route path="/sobre-nos" element={<SobreNos />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/carreiras" element={<Carreiras />} />
          
          {/* Páginas Legais */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/cookies" element={<Cookies />} />
          <Route path="/lgpd" element={<LGPD />} />
          
          {/* Sistema de Indicações */}
          <Route path="/r/:code" element={<ReferralPage />} />
          
          {/* Portfólio Público */}
          <Route path="/portfolio/galeria" element={<PortfolioGaleria />} />
          <Route path="/portfolio/galeria/:id" element={<PortfolioGaleriaTrabalho />} />
          
          {/* Entrega de Fotos Pública */}
          <Route path="/entrega-fotos/:slug" element={<EntregaFotosVisualizacao />} />
          
          {/* Contrato Público */}
          <Route path="/contrato/:slug" element={<ClientContract />} />
          
          {/* Agenda Cliente (Acesso direto sem autenticação) */}
          <Route path="/agenda/cliente" element={<ClientAgenda />} />
          
          {/* Rota Temporária - Teste de Correção */}
          <Route path="/teste-bug-templates" element={<TesteBugCorrecao />} />
          
          {/* ========================================
              AGENDA COM LAYOUT ESPECÍFICO
              ======================================== */}
          
          <Route path="/agenda" element={
            <ProtectedRoute>
              <AgendaLayout>
                <Agenda />
              </AgendaLayout>
            </ProtectedRoute>
          } />
          
          {/* ========================================
              DASHBOARD PRINCIPAL (PROTEGIDO)
              ======================================== */}
          
          <Route element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            
            {/* Dashboard Home */}
            <Route path="/dashboard" element={<Dashboard />} />
            
            {/* Gestão de Clientes */}
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/clientes-simples" element={<SimpleClientes />} />
            
            {/* Financeiro */}
            <Route path="/financeiro" element={<Financeiro />} />
            
            {/* Sistema de Mensagens */}
            <Route path="/mensagens" element={<Mensagens />} />
            
            {/* Gestão de Contratos */}
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/contratos/:slug" element={<ContractDetails />} />
            
            {/* Sistema de Indicações */}
            <Route path="/indique-ganhe" element={<Indicacoes />} />
            <Route path="/indicacoes" element={<Navigate to="/indique-ganhe" replace />} />
            
            {/* Configurações */}
            <Route path="/configuracoes" element={<Navigate to="/configuracoes-empresa" replace />} />
            <Route path="/configuracoes-empresa" element={<Configuracoes />} />
            <Route path="/configuracoes-preferencias" element={<Configuracoes />} />
            <Route path="/configuracoes-integracoes" element={<Configuracoes />} />
            <Route path="/configuracoes-imagens" element={<Configuracoes />} />
            <Route path="/configuracoes-seguranca" element={<Configuracoes />} />
            
            {/* Relatórios e Atividades */}
            <Route path="/relatorios" element={<Reports />} />
            <Route path="/atividades" element={<Navigate to="/atividades-linha-do-tempo" replace />} />
            <Route path="/atividades-linha-do-tempo" element={<HistoricoAtividades />} />
            <Route path="/atividades-notificacoes" element={<HistoricoAtividades />} />
            <Route path="/atividades-filtros" element={<HistoricoAtividades />} />
            
            {/* Informações do Sistema */}
            <Route path="/info" element={<Info />} />
            
            {/* Diagnóstico */}
            <Route path="/diagnostico-supabase" element={<DiagnosticoSupabase />} />
            
            {/* Área de Testes */}
            <Route path="/dashboard/testes" element={<Testes />} />
            <Route path="/dashboard/teste-supabase" element={<SupabaseUploadTest />} />
            
            {/* ========================================
                PORTFÓLIO (PROTEGIDO)
                ======================================== */}
            
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/portfolio/novo" element={<PortfolioNovo />} />
            <Route path="/portfolio/:id" element={<PortfolioDetalhes />} />
            <Route path="/portfolio/design" element={<PortfolioDesign />} />
            <Route path="/portfolio/integracoes" element={<PortfolioIntegracoes />} />
            <Route path="/portfolio/dominio" element={<PortfolioDominio />} />
            
            {/* ========================================
                ÁREA ADMINISTRATIVA (ADMIN ONLY)
                ======================================== */}
            
            {/* Roadmap */}
            <Route path="/roadmap" element={
              <AdminRoute>
                <Roadmap />
              </AdminRoute>
            } />
            
            {/* Entrega de Fotos */}
            <Route path="/entrega-fotos" element={
              <AdminRoute>
                <EntregaFotos />
              </AdminRoute>
            } />
            
            <Route path="/entrega-fotos/admin" element={
              <AdminRoute>
                <EntregaFotosAdmin />
              </AdminRoute>
            } />
            
            <Route path="/escolher-album" element={
              <AdminRoute>
                <EscolherAlbum />
              </AdminRoute>
            } />
            
            {/* ========================================
                PORTAL DO CLIENTE (ADMIN ONLY)
                ======================================== */}
            
            <Route path="/cliente" element={
              <AdminRoute>
                <ClientTabLayout>
                  <ClientDashboard />
                </ClientTabLayout>
              </AdminRoute>
            } />
            
            <Route path="/cliente/agenda" element={
              <AdminRoute>
                <ClientTabLayout>
                  <ClientAgenda />
                </ClientTabLayout>
              </AdminRoute>
            } />
            
            <Route path="/cliente/pagamentos" element={
              <AdminRoute>
                <ClientTabLayout>
                  <ClientPayments />
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
            
            <Route path="/cliente/contratos" element={
              <AdminRoute>
                <ClientTabLayout>
                  <ClientContracts />
                </ClientTabLayout>
              </AdminRoute>
            } />
            
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
          
          {/* ========================================
              FALLBACK - PÁGINA NÃO ENCONTRADA
              ======================================== */}
          
          <Route path="*" element={<NotFound />} />
          
        </Routes>
      </Suspense>
    </LazyLoadErrorBoundary>
  );
};

export default AppRoutes;
