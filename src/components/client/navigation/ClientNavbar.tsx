
import React from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Menu, ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ClientNavbarProps {
  onLogout: () => Promise<void>;
  toggleMobileMenu: () => void;
}

const ClientNavbar = ({ onLogout, toggleMobileMenu }: ClientNavbarProps) => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      {/* Logo - sempre à esquerda */}
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://storage.alboom.ninja/sites/82835/albuns/1409267/logo-vertical-cores-e-preto.png?t=1741391284"
            alt="Logo"
            className="h-8 w-auto"
          />
          <span className="font-bold hidden sm:inline">Portal do Cliente</span>
        </Link>
      </div>
      
      {/* Ações do lado direito */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Menu hambúrguer - apenas mobile, sempre à direita */}
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
        
        {/* Botão Dashboard - desktop */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onLogout} 
          className="gap-2 hidden md:flex"
          title="Voltar ao Dashboard"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Dashboard</span>
          <span className="sr-only">Voltar ao Dashboard</span>
        </Button>
      </div>
    </header>
  );
};

export default ClientNavbar;
