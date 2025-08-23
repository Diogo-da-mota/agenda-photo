
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AuthModalLayout } from './AuthUtils';
import { LoginForm } from './login';

interface LoginModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onRegisterClick: () => void;
}

const LoginModal = ({ isOpen, onOpenChange, onRegisterClick }: LoginModalProps) => {
  const isMobile = useIsMobile();
  
  // Debug logs temporários
  console.log('[DEBUG] LoginModal renderizado:', { isOpen, isMobile });
  
  React.useEffect(() => {
    console.log('[DEBUG] LoginModal isOpen mudou:', isOpen);
  }, [isOpen]);

  const switchToRegister = () => {
    onOpenChange(false);
    setTimeout(() => {
      onRegisterClick();
    }, 100);
  };

  const handleLoginSuccess = () => {
    onOpenChange(false);
  };

  return (
    <AuthModalLayout
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Bem-vindo à Agenda PRO"
      footerText="Não tem uma conta?"
      footerActionText="Inscreva-se agora"
      onFooterActionClick={switchToRegister}
    >
      <LoginForm onSuccess={handleLoginSuccess} />
    </AuthModalLayout>
  );
};

export default LoginModal;
