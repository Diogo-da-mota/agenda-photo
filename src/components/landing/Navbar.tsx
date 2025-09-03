import React, { useState, useEffect } from 'react';
import LandingLogo from "./LandingLogo";
import ResponsiveContainer from '@/components/ResponsiveContainer';
import { TubelightButton } from "@/components/ui/tubelight-button";

interface NavbarProps {
  onLoginClick: () => void;
  onRegisterClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onLoginClick, onRegisterClick }) => {
  const [scrolled, setScrolled] = useState(false);
  
  // Debug logs temporários
  const handleLoginClick = () => {
    // console.log('[DEBUG] Botão Login clicado'); // Removido para produção
    onLoginClick();
  };
  
  const handleRegisterClick = () => {
    // console.log('[DEBUG] Botão Criar Conta clicado'); // Removido para produção
    onRegisterClick();
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm py-2 sm:py-3" 
        : "bg-transparent py-3 sm:py-5"
    }`}>
      <ResponsiveContainer maxWidth="7xl" className="overflow-x-hidden">
        <div className="flex items-center justify-between w-full max-w-full">
          {/* Logo */}
          <div className="flex-shrink-0 min-w-0 ml-4">
            <LandingLogo />
          </div>

          {/* Links de navegação - apenas desktop */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-8">
              <a href="/funcionalidades" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Funcionalidades
              </a>
              <a href="/#pricing" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Preços
              </a>
              <a href="/#testimonials" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                Depoimentos
              </a>
              <a href="/#faq" className="text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">
                FAQ
              </a>
            </div>
          </nav>

          {/* Botões de autenticação - desktop e mobile */}
          <div className="flex items-center gap-1.5 xs:gap-2 sm:gap-4">
            <TubelightButton 
              className="text-[11px] text-lg xs:text-base sm:text-lg py-1.5 xs:py-2 px-2 xs:px-3 sm:px-6"
              onClick={handleLoginClick}
            >
              Login
            </TubelightButton>
            
            <TubelightButton 
              className="text-[11px] text-lg xs:text-base sm:text-lg py-1.5 xs:py-2 px-2 xs:px-3 sm:px-6"
              onClick={handleRegisterClick}
            >
              Criar Conta
            </TubelightButton>
          </div>
        </div>
      </ResponsiveContainer>
    </header>
  );
};

export default Navbar;
