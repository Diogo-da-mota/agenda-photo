// src/components/dashboard/DashboardHeader.tsx
import React, { useState } from 'react';
import { AlignJustify, Search, Settings, Gift, LogOut, BellRing } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ThemeToggle from '@/components/ThemeToggle';
import Notifications from '@/components/dashboard/Notifications';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface DashboardHeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const [notificationPermission, setNotificationPermission] = useState(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // TODO: Substitua esta chave VAPID pública pela sua própria chave gerada.
  const vapidPublicKey = 'BIPulhD9iAUP13f_4aSoi1y53a3a_RkSg2Y2yWfWExVf-A9YJ6aZzE_k3o5c_zXVvWJg9wJ1bZ_8c_g8c';

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleEnableNotifications = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);

      if (permission === 'granted') {
        toast({
          title: "Notificações ativadas!",
          description: "Você receberá lembretes dos seus eventos.",
        });

        try {
            const swRegistration = await navigator.serviceWorker.ready;
            const subscription = await swRegistration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });
            
            console.log('Inscrição Push Gerada: ', JSON.stringify(subscription));
            
            // TODO: Envie o objeto 'subscription' para o seu backend para armazenar.
            // Exemplo:
            // await fetch('/api/subscribe', {
            //   method: 'POST',
            //   body: JSON.stringify(subscription),
            //   headers: {
            //     'Content-Type': 'application/json',
            //   },
            // });

            toast({
              title: "Inscrição realizada com sucesso!",
              description: "Tudo pronto para receber notificações.",
            });

        } catch (error) {
            console.error('Falha ao se inscrever para notificações push:', error);
            toast({
              title: "Erro na inscrição",
              description: "Não foi possível se inscrever para notificações.",
              variant: "destructive",
            });
        }
      } else {
        toast({
          title: "Notificações não ativadas",
          description: "Você não permitiu o recebimento de notificações.",
          variant: "destructive",
        });
      }
    } else {
        toast({
            title: "Navegador não compatível",
            description: "Seu navegador não suporta notificações push.",
            variant: "destructive",
        });
    }
  };
  
  const handleLogout = async () => {
    try {
      // console.log('[DEBUG] Iniciando processo de logout...'); // Removido para produção
      await signOut();
      // console.log('[DEBUG] Logout executado com sucesso'); // Removido para produção
      toast({
        title: "Sessão encerrada",
        description: "Você saiu do sistema com sucesso."
      });
    } catch (error) {
      // console.error('[ERROR] Erro ao fazer logout:', error); // Removido para produção
      toast({
        title: "Erro ao sair",
        description: "Não foi possível encerrar sua sessão. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <header className="sticky top-0 z-10 h-16 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      <div className="flex h-16 items-center px-4">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="md:hidden">
          <AlignJustify className="h-5 w-5" />
        </Button>
        
        {/* Busca Global */}
        <div className="relative ml-4 md:ml-6 flex-1 max-w-md">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground hidden md:block" />
          <Input
            placeholder="Buscar..."
            className="pl-8 bg-transparent hidden md:flex w-full md:w-auto"
          />
        </div>
        
        {/* Ações do lado direito */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Indique e Ganhe */}
          <Button 
            variant="outline" 
            size="sm" 
            className="hidden md:flex items-center gap-1 border-dashed"
            onClick={() => navigate('/indique-ganhe')}
          >
            <Gift className="h-4 w-4 text-amber-500" />
            <span>Indique e Ganhe</span>
          </Button>
          
          <Notifications />

          {notificationPermission !== 'granted' && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnableNotifications}
              className="hidden md:flex items-center gap-1"
            >
              <BellRing className="h-4 w-4" />
              <span>Ativar Avisos</span>
            </Button>
          )}
          
          <ThemeToggle />
          
          <Button variant="ghost" size="icon" asChild>
            <a href="/configuracoes">
              <Settings className="h-5 w-5" />
            </a>
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleLogout}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
