import React from 'react';
import Sidebar from '@/components/dashboard/sidebar/Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { useDashboardLayout } from './hooks';
import { AgendaMainContent } from './components';

interface AgendaLayoutProps {
  children?: React.ReactNode;
}

const AgendaLayout: React.FC<AgendaLayoutProps> = ({ children }) => {
  const { sidebarOpen, toggleSidebar } = useDashboardLayout();

  return (
    <div className="flex h-screen bg-[#0B0F17] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content - Sem Header */}
      <AgendaMainContent 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
      >
        {children}
      </AgendaMainContent>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};

export default AgendaLayout; 