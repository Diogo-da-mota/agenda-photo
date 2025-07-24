
import React from 'react';
import Sidebar from '@/components/dashboard/sidebar/Sidebar';
import { Toaster } from "@/components/ui/toaster";
import { useDashboardLayout } from './hooks';
import { DashboardMainContent } from './components';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { sidebarOpen, toggleSidebar } = useDashboardLayout();

  return (
    <div className="flex h-screen bg-[#0B0F17] text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <DashboardMainContent 
        sidebarOpen={sidebarOpen} 
        toggleSidebar={toggleSidebar}
      >
        {children}
      </DashboardMainContent>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};

export default DashboardLayout;
