import React, { useState, useEffect } from 'react';
import { Button } from './button'; // Ajuste o caminho se necessário
import { Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Tipagem para o evento BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const InstallPwaButton: React.FC = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      // Armazena o evento para que possa ser acionado mais tarde.
      setInstallPrompt(event as BeforeInstallPromptEvent);
      console.log('PWA está pronto para ser instalado.');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Limpa o listener quando o componente é desmontado
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) {
      toast({
        title: "App já instalado ou não suportado",
        description: "O aplicativo já pode estar instalado ou seu navegador não suporta a instalação.",
        variant: "default",
      });
      return;
    }

    // Mostra o prompt de instalação
    await installPrompt.prompt();

    // Aguarda o usuário responder ao prompt
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('Usuário aceitou a instalação do PWA');
      toast({
        title: "Aplicativo instalado!",
        description: "O AgendaPRO foi adicionado à sua tela inicial.",
      });
    } else {
      console.log('Usuário recusou a instalação do PWA');
    }

    // O prompt só pode ser usado uma vez.
    setInstallPrompt(null);
  };

  // Não renderiza nada se o app não for instalável
  if (!installPrompt) {
    return null;
  }

  return (
    <Button
      onClick={handleInstallClick}
      className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center animate-bounce"
      style={{ backgroundColor: '#FFFFFF' }}
      aria-label="Instalar Aplicativo"
      title="Instalar Aplicativo"
    >
      <Camera className="h-7 w-7" style={{ color: '#A142F4' }} />
    </Button>
  );
}; 