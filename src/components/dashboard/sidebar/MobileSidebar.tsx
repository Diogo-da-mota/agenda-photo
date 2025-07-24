
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MobileSidebarProps {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isMobile: boolean;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ 
  isMobileOpen, 
  setIsMobileOpen, 
  isMobile 
}) => {
  if (!isMobile) return null;
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className="fixed left-4 top-3 z-50 rounded-full bg-[#1A1F2E] text-white hover:bg-[#252A3A]"
      onClick={() => setIsMobileOpen(!isMobileOpen)}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
};

export default MobileSidebar;
