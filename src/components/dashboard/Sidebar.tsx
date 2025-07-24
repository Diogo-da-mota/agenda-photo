
import React, { useState, useEffect } from 'react';
import { SidebarHeader, Navigation } from '@/components/dashboard/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useContractCounts } from '@/hooks/useContractCounts';
import { useMessageCounts } from '@/hooks/useMessageCounts';
import { createMenuItems } from '@/components/dashboard/sidebar/menuItems';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const isMobile = useIsMobile();
  
  // Buscar dados reais
  const { counts: contractCounts } = useContractCounts({ enabled: true });
  const { counts: messageCounts } = useMessageCounts();
  
  // Generate menu items with dynamic badge counts
  const menuItems = createMenuItems(messageCounts.naoLidas, contractCounts.pendentes);
  
  // Auto-close sidebar on mobile, always open on desktop
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    } else {
      setIsOpen(true); // Sempre aberta em desktop
    }
  }, [isMobile]);
  
  const toggleSidebar = () => {
    // Só permite toggle em mobile
    if (isMobile) {
      setIsOpen(!isOpen);
    }
  };
  
  const closeMobileSidebar = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full border-r bg-background">
      <SidebarHeader 
        isOpen={isOpen} 
        toggleSidebar={toggleSidebar} 
        isMobile={isMobile} 
      />
      <Navigation 
        menuItems={menuItems} 
        isOpen={isOpen} 
        closeMobileSidebar={closeMobileSidebar} 
      />
    </div>
  );
};

export default Sidebar;
