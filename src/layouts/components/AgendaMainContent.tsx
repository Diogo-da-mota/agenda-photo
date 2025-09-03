import React from 'react';
import { Outlet } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

interface AgendaMainContentProps {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  children?: React.ReactNode;
}

const AgendaMainContent: React.FC<AgendaMainContentProps> = ({
  sidebarOpen,
  toggleSidebar,
  children
}) => {
  return (
    <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-44' : 'md:ml-12'}`}>      
      {/* Header */}
      <DashboardHeader toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-2 sm:p-4 md:p-6 bg-[#0B0F17]">
        <div className="w-full h-full max-w-full">
          {children || <Outlet />}
        </div>
      </main>
    </div>
  );
};

export default AgendaMainContent;