
import React from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Users, 
  Settings, 
  PieChart,
  Upload,
  Lightbulb,
  BarChart3,
  ChevronLeft
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Sidebar>
      <SidebarContent>
        <div className="px-3 py-4">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 rounded-md bg-gradient-to-r from-meta-blue to-blue-400 flex items-center justify-center mr-2">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">Ad Compass</span>
          </div>
          
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => navigate('/')}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center space-x-3 w-full py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100">
                    <BarChart3 className="w-5 h-5" />
                    <span>Campaigns</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center space-x-3 w-full py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100">
                    <PieChart className="w-5 h-5" />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center space-x-3 w-full py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100">
                    <Lightbulb className="w-5 h-5" />
                    <span>Insights</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center space-x-3 w-full py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100">
                    <Users className="w-5 h-5" />
                    <span>Audiences</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton className="flex items-center space-x-3 w-full py-2 px-3 rounded-lg text-gray-700 hover:bg-gray-100">
                    <Upload className="w-5 h-5" />
                    <span>Import Data</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/settings') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>
      </SidebarContent>
      
      <div className="absolute bottom-4 left-0 right-0 flex justify-center">
        <SidebarTrigger>
          <button className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 hover:bg-gray-300">
            <ChevronLeft className="w-4 h-4" />
          </button>
        </SidebarTrigger>
      </div>
    </Sidebar>
  );
};

export default AppSidebar;
