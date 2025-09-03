
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/useAuth';
import ClientLoginModal from '@/components/client/ClientLoginModal';
import ClientNavbar from '@/components/client/navigation/ClientNavbar';
import DesktopSidebar from '@/components/client/navigation/DesktopSidebar';
import MobileNavigation from '@/components/client/navigation/MobileNavigation';
import MobileBottomNav from '@/components/client/navigation/MobileBottomNav';

const ClientLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signOut, session } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  const handleLogout = async () => {
    try {
      // Opção 1: Fazer logout completo e redirecionar
      // await signOut();
      
      // Opção 2: Apenas redirecionar mantendo a sessão (recomendado)
      navigate('/dashboard');

    } catch (error) {
      console.error('Erro ao redirecionar:', error);
      toast({
        title: "Erro ao redirecionar",
        description: "Não foi possível redirecionar para o dashboard. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  useEffect(() => {
    if (!session) {
      setIsLoginModalOpen(true);
    }
  }, [session]);

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <ClientLoginModal 
        isOpen={isLoginModalOpen} 
        onOpenChange={setIsLoginModalOpen} 
      />
      
      <ClientNavbar 
        onLogout={handleLogout}
        toggleMobileMenu={toggleMobileMenu}
      />
      
      <div className="grid flex-1 md:grid-cols-[220px_1fr]">
        <DesktopSidebar currentPath={location.pathname} />
        
        <MobileNavigation 
          isOpen={mobileMenuOpen}
          currentPath={location.pathname}
          onClose={() => setMobileMenuOpen(false)}
        />
        
        <main className="flex flex-1 flex-col p-4 md:gap-8 md:p-8">
          <Outlet />
        </main>
      </div>
      
      <MobileBottomNav currentPath={location.pathname} />
      
      <Toaster />
    </div>
  );
};

export default ClientLayout;
