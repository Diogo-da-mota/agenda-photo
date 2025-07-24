import React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import UserProfile from './UserProfile';
import Navigation from './Navigation';
import SidebarHeader from './SidebarHeader';
import SidebarFooter from './SidebarFooter';
import { MenuItem } from './types';
import { useAuth } from '@/hooks/useAuth';

interface SidebarContentProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  menuItems: MenuItem[];
  profileImage: string;
  userData: { name: string; profession: string };
  closeMobileSidebar: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({
  isOpen,
  toggleSidebar,
  menuItems,
  profileImage,
  userData,
  closeMobileSidebar
}) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.user_metadata?.role === 'admin';

  return (
    <div className="flex flex-col h-full">
      {/* Sidebar Header with Logo */}
      <SidebarHeader 
        isOpen={isMobile ? true : isOpen} 
        toggleSidebar={toggleSidebar}
        isMobile={isMobile}
      />
      
      {/* User Profile */}
      {isAdmin && (
        <div style={{ backgroundColor: '#94A3B8' }}>
          <UserProfile
            isOpen={isMobile ? true : isOpen}
            profileImage={profileImage}
            userData={userData}
            closeMobileSidebar={closeMobileSidebar}
          />
        </div>
      )}
      
      {/* Navigation */}
      <Navigation
        menuItems={menuItems}
        isOpen={isMobile ? true : isOpen}
        closeMobileSidebar={closeMobileSidebar}
      />
      
      {/* Sidebar Footer com Botão de Sincronização */}
      <SidebarFooter
        isOpen={isMobile ? true : isOpen}
        closeMobileSidebar={closeMobileSidebar}
      />
    </div>
  );
};

export default SidebarContent;
