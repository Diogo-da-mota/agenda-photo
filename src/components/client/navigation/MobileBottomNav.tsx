
import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Calendar, CreditCard, FileSignature, MessageSquare } from 'lucide-react';

interface MobileBottomNavProps {
  currentPath: string;
}

const MobileBottomNav = ({ currentPath }: MobileBottomNavProps) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background p-2">
      <div className="grid grid-cols-5 gap-1">
        <Link to="/cliente" className="flex flex-col items-center py-2">
          <Home className={`h-5 w-5 ${currentPath === '/cliente' ? 'text-primary' : ''}`} />
          <span className="text-xs mt-1">Home</span>
        </Link>
        <Link to="/cliente/agenda" className="flex flex-col items-center py-2">
          <Calendar className={`h-5 w-5 ${currentPath === '/cliente/agenda' ? 'text-primary' : ''}`} />
          <span className="text-xs mt-1">Agenda</span>
        </Link>
        <Link to="/cliente/pagamentos" className="flex flex-col items-center py-2">
          <CreditCard className={`h-5 w-5 ${currentPath === '/cliente/pagamentos' ? 'text-primary' : ''}`} />
          <span className="text-xs mt-1">Pagamentos</span>
        </Link>
        <Link to="/cliente/contratos" className="flex flex-col items-center py-2">
          <FileSignature className={`h-5 w-5 ${currentPath.includes('/cliente/contratos') ? 'text-primary' : ''}`} />
          <span className="text-xs mt-1">Contratos</span>
        </Link>
        <Link to="/cliente/orcamento" className="flex flex-col items-center py-2">
          <MessageSquare className={`h-5 w-5 ${currentPath === '/cliente/orcamento' ? 'text-primary' : ''}`} />
          <span className="text-xs mt-1">Orçamento</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileBottomNav;
