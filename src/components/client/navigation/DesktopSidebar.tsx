
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, MessageSquare, Home, FileSignature } from 'lucide-react';

interface DesktopSidebarProps {
  currentPath: string;
}

const DesktopSidebar = ({ currentPath }: DesktopSidebarProps) => {
  return (
    <aside className="hidden border-r md:block">
      <div className="flex h-full max-h-screen flex-col gap-2 p-4">
        <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
          <Link to="/cliente">
            <Button
              variant={currentPath === '/cliente' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/cliente/agenda">
            <Button
              variant={currentPath === '/cliente/agenda' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Calendar className="mr-2 h-4 w-4" />
              Minha Agenda
            </Button>
          </Link>
          <Link to="/cliente/pagamentos">
            <Button
              variant={currentPath === '/cliente/pagamentos' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Pagamentos
            </Button>
          </Link>
          <Link to="/cliente/contratos">
            <Button
              variant={currentPath.includes('/cliente/contratos') ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <FileSignature className="mr-2 h-4 w-4" />
              Contratos
            </Button>
          </Link>
          <Link to="/cliente/orcamento">
            <Button
              variant={currentPath === '/cliente/orcamento' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Solicitar Orçamento
            </Button>
          </Link>
        </nav>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
