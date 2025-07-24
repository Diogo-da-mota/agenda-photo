import React from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Image, Palette, Link2, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  isAdminOnly?: boolean;
}

interface PortfolioNavBarProps {
  activeTab?: string;
  className?: string;
}

const PortfolioNavBar: React.FC<PortfolioNavBarProps> = ({
  activeTab = 'portfolio',
  className
}) => {
  const { user } = useAuth();
  
  // Verificar se o usuário é admin
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';
  
  const navItems: NavItem[] = [
    {
      label: 'Portfólio',
      value: 'portfolio',
      href: '/portfolio',
      icon: <Image className="w-4 h-4" />
    },
    {
      label: 'Design',
      value: 'design',
      href: '/portfolio/design',
      icon: <Palette className="w-4 h-4" />,
      isAdminOnly: true
    },
    {
      label: 'Integrações',
      value: 'integracoes',
      href: '/portfolio/integracoes',
      icon: <Link2 className="w-4 h-4" />,
      isAdminOnly: true
    },
    {
      label: 'Domínio',
      value: 'dominio',
      href: '/portfolio/dominio',
      icon: <Globe className="w-4 h-4" />,
      isAdminOnly: true
    },
  ];

  // Filtrar itens baseado no papel do usuário
  const visibleItems = navItems.filter(item => !item.isAdminOnly || isAdmin);

  return (
    <div className={cn('flex overflow-x-auto whitespace-nowrap gap-0.5 sm:gap-1 border-b pb-2', className)}>
      {visibleItems.map((item) => (
        <Link
          key={item.value}
          to={item.href}
          className={cn(
            'flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-colors flex-shrink-0 rounded-t-md min-w-0',
            'hover:text-primary hover:bg-muted/50',
            {
              'text-primary border-b-2 border-primary bg-muted/30': activeTab === item.value,
              'text-muted-foreground': activeTab !== item.value,
            },
            // Aplicar background vermelho para abas de admin
            item.isAdminOnly && isAdmin ? 'bg-[#DC2626] text-white hover:bg-[#B91C1C]' : ''
          )}
        >
          {item.icon}
          <span className="truncate">{item.label}</span>
        </Link>
      ))}
    </div>
  );
};

export default PortfolioNavBar;
