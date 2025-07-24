
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Logo from '@/components/Logo';

interface SidebarHeaderProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isMobile: boolean;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ isOpen, toggleSidebar, isMobile }) => {
  return (
    <div className="px-2 flex items-center justify-between border-b border-[#1F2937] h-16">
      {/* Logo - oculta em mobile para evitar sobreposição com menu hamburger */}
      <div className={`flex-1 flex items-center justify-center ${isMobile ? 'hidden' : ''}`}>
        <Logo />
      </div>
      
      {/* Espaçador em mobile para manter altura consistente */}
      {isMobile && <div className="flex-1"></div>}
      
      {!isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="absolute right-2 h-8 w-8 rounded-full text-gray-300 hover:bg-[#1A1F2E] hover:text-white"
        >
          {isOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      )}
    </div>
  );
};

export default SidebarHeader;
