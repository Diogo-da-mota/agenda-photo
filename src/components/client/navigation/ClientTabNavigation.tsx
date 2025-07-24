import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Calendar,
  CreditCard,
  FileText,
  Home,
  MessageSquare
} from 'lucide-react';

interface TabItem {
  id: string;
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const tabs: TabItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/cliente',
    icon: Home
  },
  {
    id: 'agenda',
    label: 'Minha Agenda',
    path: '/cliente/agenda',
    icon: Calendar
  },
  {
    id: 'pagamentos',
    label: 'Pagamentos',
    path: '/cliente/pagamentos',
    icon: CreditCard
  },
  {
    id: 'contratos',
    label: 'Contratos',
    path: '/cliente/contratos',
    icon: FileText
  },
  {
    id: 'orcamento',
    label: 'Solicitar Orçamento',
    path: '/cliente/orcamento',
    icon: MessageSquare
  }
];

const ClientTabNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActiveTab = (path: string) => {
    if (path === '/cliente') {
      return location.pathname === '/cliente';
    }
    return location.pathname.startsWith(path);
  };

  const handleTabClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="w-full border-b border-border bg-background">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="flex space-x-1 p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = isActiveTab(tab.path);
            
            return (
              <Button
                key={tab.id}
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleTabClick(tab.path)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="font-medium">{tab.label}</span>
              </Button>
            );
          })}
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="flex overflow-x-auto scrollbar-hide">
          <div className="flex space-x-1 p-1 min-w-max">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = isActiveTab(tab.path);
              
              return (
                <Button
                  key={tab.id}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => handleTabClick(tab.path)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md transition-all duration-200 whitespace-nowrap',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientTabNavigation;