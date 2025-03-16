
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <div className="relative z-10 text-white text-center px-4 max-w-4xl w-full">
      <h2 className="text-sm sm:text-lg uppercase tracking-wider mb-2">AGENDA PRO</h2>
      <h1 className={`text-2xl sm:text-4xl md:text-5xl font-bold mb-4 ${isMobile ? 'leading-tight' : ''}`}>
        {isMobile ? (
          "A solução completa para fotógrafos profissionais"
        ) : (
          "A solução completa para fotógrafos profissionais"
        )}
      </h1>
      <p className="text-base sm:text-lg md:text-xl opacity-90 mb-6 sm:mb-10">
        Gerencie sua agenda, clientes, finanças e presença online em um único lugar
      </p>
      <Button 
        onClick={() => navigate('/survey')}
        size="lg"
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg sm:text-xl py-4 px-8 sm:px-10 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        {isMobile ? "COMEÇAR AGORA" : "COMEÇAR AGORA"}
      </Button>
    </div>
  );
};

export default HeroSection;
