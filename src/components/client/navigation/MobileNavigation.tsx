
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, CreditCard, FileSignature, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface MobileNavigationProps {
  isOpen: boolean;
  currentPath: string;
  onClose: () => void;
}

const MobileNavigation = ({ isOpen, currentPath, onClose }: MobileNavigationProps) => {
  if (!isOpen) return null;

  return (
    <div className="md:hidden fixed inset-0 z-40 flex">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative w-4/5 max-w-xs bg-background p-4 overflow-y-auto">
        <nav className="grid gap-2">
          <Link to="/cliente" onClick={onClose}>
            <Button
              variant={currentPath === '/cliente' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Home className="mr-2 h-5 w-5" />
              Dashboard
            </Button>
          </Link>
          <Link to="/cliente/agenda" onClick={onClose}>
            <Button
              variant={currentPath === '/cliente/agenda' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Minha Agenda
            </Button>
          </Link>
          <Link to="/cliente/pagamentos" onClick={onClose}>
            <Button
              variant={currentPath === '/cliente/pagamentos' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <CreditCard className="mr-2 h-5 w-5" />
              Pagamentos
            </Button>
          </Link>
          <Link to="/cliente/contratos" onClick={onClose}>
            <Button
              variant={currentPath.includes('/cliente/contratos') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <FileSignature className="mr-2 h-5 w-5" />
              Contratos
            </Button>
          </Link>
          <Link to="/cliente/orcamento" onClick={onClose}>
            <Button
              variant={currentPath === '/cliente/orcamento' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <MessageSquare className="mr-2 h-5 w-5" />
              Solicitar Orçamento
            </Button>
          </Link>
        </nav>
      </div>
    </div>
  );
};

export default MobileNavigation;
