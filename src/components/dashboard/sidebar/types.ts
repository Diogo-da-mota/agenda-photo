import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  name: string;
  path: string;
  icon: LucideIcon;
  iconColor?: string;
  badge?: number;
  highlight?: boolean;
  category?: string;
  roles?: string[];
  isAdminOnly?: boolean;
}

export interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}
