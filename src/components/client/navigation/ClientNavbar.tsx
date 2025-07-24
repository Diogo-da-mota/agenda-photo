
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="https://storage.alboom.ninja/sites/82835/albuns/1409267/logo-vertical-cores-e-preto.png?t=1741391284"
            alt="Logo"
            className="h-8 w-auto"
          />
          <span className="font-bold">Portal do Cliente</span>
        </Link>
      </div>
      
      <nav className="flex-1 md:gap-10 lg:gap-20">
        <div className="flex items-center justify-end gap-4 md:gap-6">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleMobileMenu}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Menu</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onLogout} 
            className="gap-2"
            title="Voltar ao Dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
            <span className="sr-only">Voltar ao Dashboard</span>
          </Button>
        </div>
      </nav>
    </header>
  );
};

export default ClientNavbar;
