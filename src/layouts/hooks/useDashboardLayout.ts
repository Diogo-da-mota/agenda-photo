
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

export const useDashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();
  
  // Auto-close sidebar on mobile, always open on desktop
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true); // Sempre aberta em desktop
    }
  }, [isMobile]);
  
  const toggleSidebar = () => {
    // Só permite toggle em mobile
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    }
  };

  return {
    sidebarOpen,
    setSidebarOpen,
    isMobile,
    toggleSidebar
  };
};
