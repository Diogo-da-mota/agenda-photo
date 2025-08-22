import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AdminRoute from "./components/auth/AdminRoute";
import NotFound from "./pages/NotFound";

// Working imports - keep these
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
import { TesteBugCorrecao } from "./components/debug/TesteBugCorrecao";

// Working dashboard components
import Indicacoes from "./pages/Dashboard/Indicacoes";
import Roadmap from "./pages/Dashboard/Roadmap";
import SimpleClientes from "./pages/Dashboard/SimpleClientes";
import Info from "./pages/Dashboard/Info";
import SupabaseUploadTest from "./components/testing/SupabaseUploadTest";
import DashboardLayout from "./layouts/DashboardLayout";

// Placeholder components for missing pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="p-8 text-center">
    <h1 className="text-2xl font-bold mb-4">{title}</h1>
    <p className="text-gray-600">Esta página está temporariamente indisponível.</p>
  </div>
);

const AppRoutes = () => {
  return (
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

      {/* Dashboard Routes - PROTEGIDAS */}
      <Route element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="/clientes" element={<PlaceholderPage title="Clientes" />} />
        <Route path="/clientes-simples" element={<SimpleClientes />} />
        <Route path="/financeiro" element={<PlaceholderPage title="Financeiro" />} />
        <Route path="/indique-ganhe" element={<Indicacoes />} />
        <Route path="/indicacoes" element={<Navigate to="/indique-ganhe" replace />} />
        
        {/* Rota ADMIN ONLY - Roadmap */}
        <Route path="/roadmap" element={
          <AdminRoute>
            <Roadmap />
          </AdminRoute>
        } />
        
        <Route path="/configuracoes" element={<Navigate to="/configuracoes-empresa" replace />} />
        <Route path="/configuracoes-empresa" element={<PlaceholderPage title="Configurações" />} />
        <Route path="/configuracoes-preferencias" element={<PlaceholderPage title="Configurações" />} />
        <Route path="/configuracoes-integracoes" element={<PlaceholderPage title="Configurações" />} />
        <Route path="/configuracoes-imagens" element={<PlaceholderPage title="Configurações" />} />
        <Route path="/configuracoes-seguranca" element={<PlaceholderPage title="Configurações" />} />
        
        <Route path="/mensagens" element={<PlaceholderPage title="Mensagens" />} />
        <Route path="/contratos" element={<PlaceholderPage title="Contratos" />} />
        <Route path="/contratos/:slug" element={<PlaceholderPage title="Detalhes do Contrato" />} />
        
        <Route path="/atividades" element={<Navigate to="/atividades-linha-do-tempo" replace />} />
        <Route path="/atividades-linha-do-tempo" element={<PlaceholderPage title="Histórico de Atividades" />} />
        <Route path="/atividades-notificacoes" element={<PlaceholderPage title="Histórico de Atividades" />} />
        <Route path="/atividades-filtros" element={<PlaceholderPage title="Histórico de Atividades" />} />
        <Route path="/relatorios" element={<PlaceholderPage title="Relatórios" />} />
        <Route path="/dashboard/teste-supabase" element={<SupabaseUploadTest />} />
        <Route path="/info" element={<Info />} />
        
        <Route path="/portfolio" element={<PlaceholderPage title="Portfólio" />} />
        <Route path="/portfolio/design" element={<PlaceholderPage title="Design do Portfólio" />} />
        <Route path="/portfolio/integracoes" element={<PlaceholderPage title="Integrações do Portfólio" />} />
        <Route path="/portfolio/dominio" element={<PlaceholderPage title="Domínio do Portfólio" />} />
        <Route path="/portfolio/novo" element={<PlaceholderPage title="Novo Portfólio" />} />
        <Route path="/portfolio/:id" element={<PlaceholderPage title="Detalhes do Portfólio" />} />
        
        <Route path="/entrega-fotos" element={
          <AdminRoute>
            <PlaceholderPage title="Entrega de Fotos" />
          </AdminRoute>
        } />
        
        <Route path="/entrega-fotos/admin" element={
          <AdminRoute>
            <PlaceholderPage title="Admin - Entrega de Fotos" />
          </AdminRoute>
        } />
        
        <Route path="/escolher-album" element={
          <AdminRoute>
            <PlaceholderPage title="Escolher Album" />
          </AdminRoute>
        } />
        
        <Route path="/diagnostico-supabase" element={<PlaceholderPage title="Diagnóstico Supabase" />} />
      </Route>
      
      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
