
import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

// Usando React.memo para evitar re-renderizações desnecessárias
const HeroSection: React.FC = memo(() => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNavigate = React.useCallback(() => {
    navigate('/survey');
  }, [navigate]);

  return (
    <div className="relative z-10 text-white text-center px-4 max-w-4xl w-full">
      <h2 className="text-sm sm:text-lg uppercase tracking-wider mb-2">AGENDA PRO</h2>
      <h1 className={`text-2xl sm:text-4xl md:text-5xl font-bold mb-4 ${isMobile ? 'leading-tight' : ''}`}>
        A solução completa para fotógrafos profissionais
      </h1>
      <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6 sm:mb-10">
        Gerencie sua agenda, clientes, finanças e presença online em um único lugar
      </p>
      <Button 
        onClick={handleNavigate}
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg sm:text-xl py-4 px-8 sm:px-10 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        {isMobile ? "COMEÇAR AGORA" : "COMEÇAR AGORA"}
      </Button>
    </div>
  );
});

// Adicionando displayName para ajudar em debugging
HeroSection.displayName = 'HeroSection';

export default HeroSection;
