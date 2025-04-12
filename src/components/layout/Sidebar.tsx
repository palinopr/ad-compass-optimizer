
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChartHorizontal,
  Users,
  Calendar,
  MessageSquare,
  FileBarChart,
  Settings,
  UserCircle,
  Upload,
  Facebook
} from 'lucide-react';

// Component to render a single sidebar link
const SidebarLink = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 mb-1 rounded-md text-sm ${
        isActive
          ? 'bg-slate-100 text-slate-900 font-medium'
          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
      }`}
    >
      {icon}
      <span className="ml-3">{label}</span>
    </Link>
  );
};

const Sidebar = () => {
  const { pathname } = useLocation();
  
  // Helper function to determine if a route is active
  const isActive = (path) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };
  
  return (
    <div className="hidden lg:flex flex-col w-64 border-r bg-white h-screen sticky top-0 overflow-auto">
      <div className="py-6 px-3">
        <h2 className="text-xl font-bold text-center mb-6">EventAds Pro</h2>
        
        <nav className="space-y-1">
          <SidebarLink 
            to="/" 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            isActive={isActive('/')}
          />
          
          <SidebarLink 
            to="/campaigns" 
            icon={<BarChartHorizontal size={18} />} 
            label="Campaigns" 
            isActive={isActive('/campaigns')}
          />
          
          <SidebarLink 
            to="/meta-integration" 
            icon={<Facebook size={18} />} 
            label="Meta Integration" 
            isActive={isActive('/meta-integration')}
          />
          
          <SidebarLink 
            to="/audience" 
            icon={<Users size={18} />} 
            label="Audience" 
            isActive={isActive('/audience')}
          />
          
          <SidebarLink 
            to="/events" 
            icon={<Calendar size={18} />} 
            label="Events" 
            isActive={isActive('/events')}
          />
          
          <SidebarLink 
            to="/messages" 
            icon={<MessageSquare size={18} />} 
            label="Messages" 
            isActive={isActive('/messages')}
          />
          
          <SidebarLink 
            to="/reports" 
            icon={<FileBarChart size={18} />} 
            label="Reports" 
            isActive={isActive('/reports')}
          />
          
          <SidebarLink 
            to="/import" 
            icon={<Upload size={18} />} 
            label="Import" 
            isActive={isActive('/import')}
          />
          
          <div className="pt-4 mt-4 border-t">
            <SidebarLink 
              to="/settings" 
              icon={<Settings size={18} />} 
              label="Settings" 
              isActive={isActive('/settings')}
            />
            
            <SidebarLink 
              to="/profile" 
              icon={<UserCircle size={18} />} 
              label="Profile" 
              isActive={isActive('/profile')}
            />
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
