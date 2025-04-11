
import React from 'react';
import Navbar from './Navbar';
import AppSidebar from './Sidebar';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50 w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
