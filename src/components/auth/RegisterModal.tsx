
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AuthModalLayout } from './AuthUtils';
import { RegisterForm } from './register';

interface RegisterModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onLoginClick: () => void;
}

const RegisterModal = ({ isOpen, onOpenChange, onLoginClick }: RegisterModalProps) => {
  const isMobile = useIsMobile();

  const switchToLogin = () => {
    onOpenChange(false);
    setTimeout(() => {
      onLoginClick();
    }, 100);
  };

  const handleRegisterSuccess = () => {
    onOpenChange(false);
  };

  return (
    <AuthModalLayout
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Crie sua conta na Agenda PRO"
      footerText="Já tem uma conta?"
      footerActionText="Entrar"
      onFooterActionClick={switchToLogin}
    >
      <RegisterForm onSuccess={handleRegisterSuccess} />
    </AuthModalLayout>
  );
};

export default RegisterModal;
