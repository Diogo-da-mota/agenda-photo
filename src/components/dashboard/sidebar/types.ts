import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: number;
  newBadge?: string; // Nova propriedade para badge de texto
  highlight?: boolean;
  category?: string;
  roles?: string[];
  isAdminOnly?: boolean;
}

export interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}
