import React from 'react';
import { NavLink } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MenuItem } from './types';

interface NavigationProps {
  menuItems: MenuItem[];
  isOpen: boolean;
  closeMobileSidebar: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ menuItems, isOpen, closeMobileSidebar }) => {
  // Agrupar itens por categoria
  const groupedItems = menuItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    const category = item.category || "OUTROS";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});

  // Ordem predefinida de categorias
  const categoryOrder = ["PRINCIPAL", "FINANCEIRO", "CONTRATOS", "ATIVIDADES", "SITE", "RECURSOS", "SISTEMA", "OUTROS"];

  const sortedCategories = Object.keys(groupedItems).sort((a, b) => {
    return categoryOrder.indexOf(a) - categoryOrder.indexOf(b);
  });

  return (
    <nav className="flex-1 overflow-y-auto px-1 py-3">
      {sortedCategories.map(category => (
        <div key={category} className="mb-4">
          {isOpen && (
            <div className="px-1 mb-1">
              <h3 className="text-xs font-semibold text-gray-400">{category}</h3>
            </div>
          )}
          <ul className="space-y-2">
            {groupedItems[category].map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center py-2 px-2 rounded-md text-base transition-all",
                      isOpen ? "justify-start" : "justify-center",
                      // Background vermelho para itens admin-only
                      item.isAdminOnly 
                        ? "bg-red-600 text-white hover:bg-red-700" 
                        : isActive
                          ? "bg-brand-blue text-white" // Usando a cor azul da marca para o item ativo
                          : "text-gray-300 hover:bg-[#1A1F2E] hover:text-white",
                      item.highlight ? "font-medium" : ""
                    )
                  }
                  onClick={closeMobileSidebar}
                >
                  <div className="relative">
                    <item.icon className={cn("h-5 w-5", !isOpen ? "mx-auto" : "mr-2")} 
                      style={{ color: item.iconColor || (isOpen ? "currentColor" : "currentColor") }} 
                    />
                    {item.badge && (
                      <Badge 
                        className="absolute -top-2 -right-2 flex items-center justify-center h-4 min-w-4 text-[10px] text-black" 
                        variant="outline"
                        style={{ backgroundColor: "#FBBC05" }} // Aplicando diretamente a cor amarela
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                  {isOpen && (
                    <span className="truncate">{item.name}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
};

export default Navigation;
