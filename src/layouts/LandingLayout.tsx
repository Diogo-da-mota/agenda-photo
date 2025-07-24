import React, { ReactNode } from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import LoginModal from '@/components/auth/LoginModal';
import RegisterModal from '@/components/auth/RegisterModal';
import { Toaster } from "@/components/ui/toaster";
import { InstallPwaButton } from '@/components/ui/InstallPwaButton';

interface LandingLayoutProps {
  children: ReactNode | ((props: { onRegisterClick: () => void }) => ReactNode);
}

const LandingLayout: React.FC<LandingLayoutProps> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = React.useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = React.useState(false);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onOpenChange={setIsLoginModalOpen} 
        onRegisterClick={handleRegisterClick}
      />

      {/* Register Modal */}
      <RegisterModal 
        isOpen={isRegisterModalOpen} 
        onOpenChange={setIsRegisterModalOpen}
        onLoginClick={handleLoginClick}
      />

      {/* Navbar */}
      <Navbar 
        onLoginClick={handleLoginClick} 
        onRegisterClick={handleRegisterClick} 
      />

      {/* Main Content */}
      <main className="flex-1">
        {typeof children === 'function' ? children({ onRegisterClick: handleRegisterClick }) : children}
      </main>

      {/* Footer */}
      <Footer />
      
      {/* Toaster for notifications */}
      <Toaster />

      {/* Botão flutuante para instalar o PWA */}
      <InstallPwaButton />
    </div>
  );
};

export default LandingLayout;
