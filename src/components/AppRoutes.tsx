
import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout from '@/layouts/DashboardLayout';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Clientes from '@/pages/Dashboard/Clientes';
import Agenda from '@/pages/Dashboard/Agenda';
import Configuracoes from '@/pages/Dashboard/Configuracoes';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Importações diretas para melhor confiabilidade
import Portfolio from '@/pages/Dashboard/Portfolio';
import PortfolioGaleria from '@/pages/Dashboard/PortfolioGaleria';

// Componente de loading para Suspense
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-white/70">Carregando...</p>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      {/* Rota pública da galeria */}
      <Route 
        path="/portfolio/galeria" 
        element={<PortfolioGaleria />} 
      />

      {/* Rota raiz */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      
      {/* Rotas protegidas */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      
      <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/agenda" element={<Agenda />} />
        <Route 
          path="/portfolio" 
          element={<Portfolio />} 
        />
        <Route path="/configuracoes" element={<Configuracoes />} />
      </Route>

      {/* Fallback para rotas não encontradas */}
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/portfolio/galeria"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
