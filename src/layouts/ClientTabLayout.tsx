import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Home, LogOut, User, Menu, X, Camera } from 'lucide-react';
import { useClienteAuth } from '@/contexts/ClienteAuthContext';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClientTabLayoutProps {
  children: React.ReactNode;
}

const ClientTabLayout: React.FC<ClientTabLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Usar o contexto de autenticação diretamente como no ClientWelcome
  const { isAuthenticated, cliente, logout } = useClienteAuth();
  
  // DEBUG: Log do estado do cliente no ClientTabLayout
  useEffect(() => {
    console.log('🔍 [ClientTabLayout] DEBUG - Estado do contexto:', {
      isAuthenticated,
      cliente: cliente,
      titulo: cliente?.titulo,
      nome_completo: cliente?.nome_completo,
      hasCliente: !!cliente,
      clienteKeys: cliente ? Object.keys(cliente) : [],
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      currentPath: location.pathname
    });
  }, [isAuthenticated, cliente, location.pathname]);

  
  const handleContratosClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (isAuthenticated && cliente) {
      navigate('/agenda/cliente-contratos');
    } else {
      toast.error('Você precisa estar logado para acessar os contratos');
      navigate('/agenda/cliente-login');
    }
  };

  const handleAgendaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/agenda/cliente');
  };

  const handleMinhaAgendaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/agenda/cliente-minha-agenda');
  };

  const handleLogout = () => {
    if (logout) {
      logout();
    } else {
      // Fallback: limpar localStorage se o contexto não estiver disponível
      localStorage.removeItem('cliente_auth');
      toast.success('Logout realizado com sucesso!');
    }
    navigate('/agenda/cliente-login');
  };

  return (
    <div className="flex h-screen">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#0B0F17] border-b border-[#1F2937] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-medium">
          <div className="relative">
            <Camera 
              className="h-6 w-6 text-blue-600 dark:text-blue-400" 
              strokeWidth={2} 
            />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500" />
            </span>
          </div>
          
          <div className="font-display text-xl flex items-center">
            <span className="text-slate-900 dark:text-white">Agenda</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">PRO</span>
          </div>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white p-2"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar Fixa */}
      <aside className={cn(
        "fixed h-full z-40 bg-[#0B0F17] border-r border-[#1F2937] transition-all duration-300 flex flex-col",
        "md:left-0 w-44",
        isMobileMenuOpen ? "left-0" : "-left-44",
        "md:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header da Sidebar com Logo - apenas desktop */}
          <div className="hidden md:flex px-2 items-center justify-center border-b border-[#1F2937] h-16">
            <div className="flex items-center gap-2 font-medium">
              <div className="relative">
                <Camera 
                  className="h-6 w-6" 
                  strokeWidth={2}
                  style={{ color: '#a142f4' }}
                />
                <span className="absolute -top-1 -right-1 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: '#a142f4' }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: '#a142f4' }} />
                </span>
              </div>
              
              <div className="font-display text-xl flex items-center">
                <span className="text-white">Agenda</span>
                <span className="font-bold" style={{ color: '#a142f4' }}>PRO</span>
              </div>
            </div>
          </div>

          {/* Espaçamento para mobile */}
          <div className="md:hidden h-16" />

          {/* Informações do Cliente */}
          <div className="p-3 border-b border-[#1F2937]">
            <div className="flex items-center space-x-2">
              <User className="h-6 w-6 text-blue-400" />
              <div className="flex-1 min-w-0">
                <h2 className="text-xs font-semibold text-white truncate">
                  {cliente?.titulo || 'Portal do Cliente'}
                </h2>
                <p className="text-xs text-gray-400 truncate">
                  Área do Cliente
                </p>
              </div>
            </div>
          </div>

          {/* Navegação */}
          <nav className="flex-1 overflow-y-auto px-1 py-3">
            <div className="mb-4">
              <div className="px-1 mb-1">
                <h3 className="text-xs font-semibold text-gray-400">PRINCIPAL</h3>
              </div>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={handleAgendaClick}
                    className={cn(
                      "flex items-center py-2 px-2 rounded-md text-base transition-all w-full justify-start",
                      currentPath === '/agenda/cliente'
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-[#1A1F2E] hover:text-white"
                    )}
                  >
                    <Home className="h-5 w-5 mr-2" />
                    <span className="truncate">Início</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleMinhaAgendaClick}
                    className={cn(
                      "flex items-center py-2 px-2 rounded-md text-base transition-all w-full justify-start",
                      currentPath === '/agenda/cliente-minha-agenda'
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-[#1A1F2E] hover:text-white"
                    )}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    <span className="truncate">Minha Agenda</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={handleContratosClick}
                    className={cn(
                      "flex items-center py-2 px-2 rounded-md text-base transition-all w-full justify-start",
                      currentPath.includes('/agenda/cliente-contratos')
                        ? "bg-blue-600 text-white"
                        : "text-gray-300 hover:bg-[#1A1F2E] hover:text-white"
                    )}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    <span className="truncate">Contratos</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          {/* Footer da Sidebar */}
          {isAuthenticated && (
            <div className="p-3 border-t border-[#13937]">
              <button
                onClick={handleLogout}
                className="flex items-center py-2 px-2 rounded-md text-base transition-all w-full justify-start text-red-400 hover:bg-red-900/20 hover:text-red-300"
              >
                <LogOut className="h-5 w-5 mr-2" />
                <span className="truncate">Sair</span>
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Conteúdo da página com margem para a sidebar fixa */}
      <div className="flex-1 md:ml-44 overflow-auto" style={{backgroundColor: '#0B0F17'}}>
        <div className="p-6 md:pt-6 pt-20">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ClientTabLayout;