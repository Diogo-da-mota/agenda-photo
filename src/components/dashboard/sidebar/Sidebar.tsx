import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserRole } from '@/hooks/useUserRole';
import { SidebarProps } from './types';

import SidebarContent from './SidebarContent';
import { createMenuItems } from './menuItems';
import { useSidebarState, useSidebarBadges } from './hooks';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const isMobile = useIsMobile();
  const { role } = useUserRole();
  const {
    isMobileOpen,
    setIsMobileOpen,
    profileImage,
    userData
  } = useSidebarState();
  
  const {
    unreadMessages,
    pendingContracts
  } = useSidebarBadges();
  
  const closeMobileSidebar = () => {
    if (isMobile && isOpen) {
      toggleSidebar();
    }
  };
  
  // Generate menu items with dynamic badge counts
  const allMenuItems = createMenuItems(unreadMessages, pendingContracts);
  
  // Filter menu items based on user role
  const menuItems = allMenuItems.filter(item => {
    if (!item.roles) return true; // No role restriction
    return item.roles.includes(role);
  });

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
           "fixed h-full z-40 bg-[#0B0F17] border-r border-[#1F2937] transition-all duration-300 flex flex-col",
           // Em dispositivos móveis, sidebar mais compacta
           isMobile ? (isOpen ? "left-0 w-[60%] max-w-[220px]" : "-left-full") : "left-0",
           // Em desktop, largura menor para mais espaço
           !isMobile && (isOpen ? "w-44" : "w-12")
        )}
      >
        <SidebarContent
          isOpen={isOpen}
          toggleSidebar={toggleSidebar}
          menuItems={menuItems}
          profileImage={profileImage}
          userData={userData}
          closeMobileSidebar={closeMobileSidebar}
        />
      </aside>
    </>
  );
};

export default Sidebar;
