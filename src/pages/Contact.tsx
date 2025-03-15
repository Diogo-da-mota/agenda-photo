
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import LoginDialog from "@/components/admin/LoginDialog";
import HeroSection from "@/components/hero/HeroSection";
import { useAdminUser } from "@/hooks/useAdminUser";
import { useNavigate } from "react-router-dom";

const Contact = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAuthenticated, logoutAdmin } = useAdminUser();
  const navigate = useNavigate();

  const handleAdminClick = () => {
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      setIsLoginOpen(true);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center">
      {/* Imagem de fundo com sobreposição */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/lovable-uploads/99d33cab-856f-4fc2-a814-58f0764face9.png" 
          alt="Fotógrafo profissional" 
          className="w-full h-full object-cover"
        />
        {/* Sobreposição para tornar o texto mais visível */}
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      </div>
      
      {/* Botão de login/admin no canto superior direito */}
      <div className="absolute top-4 right-4 z-10">
        <Button 
          onClick={handleAdminClick}
          variant="outline" 
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
        >
          {isAuthenticated ? "Painel Admin" : "Admin"}
        </Button>
      </div>
      
      {/* Diálogo de Login */}
      <LoginDialog 
        isOpen={isLoginOpen} 
        onOpenChange={setIsLoginOpen}
      />

      {/* Conteúdo sobreposto na imagem */}
      <HeroSection />
    </div>
  );
};

export default Contact;
