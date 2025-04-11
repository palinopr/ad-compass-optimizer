
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
  ChevronLeft,
  Calendar,
  MessageSquare,
  FileText,
  User,
  Building2,
  LineChart,
  Megaphone
} from 'lucide-react';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent,
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarTrigger
} from '@/components/ui/sidebar';
import { useNavigate, useLocation } from 'react-router-dom';

// Mock function to determine user role - this would be replaced with actual auth logic
const getUserRole = () => {
  // For demonstration purposes only
  return 'admin'; // or 'client'
};

const AppSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();

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
            <span className="text-lg font-bold">Outlet Media</span>
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
                
                {userRole === 'admin' && (
                  <>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/clients') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => navigate('/clients')}
                      >
                        <Building2 className="w-5 h-5" />
                        <span>Client Management</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/performance') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => navigate('/performance')}
                      >
                        <LineChart className="w-5 h-5" />
                        <span>Agency Performance</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/pipeline') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                        onClick={() => navigate('/pipeline')}
                      >
                        <Users className="w-5 h-5" />
                        <span>Client Pipeline</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </>
                )}
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/campaigns') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => navigate('/campaigns')}
                  >
                    <BarChart3 className="w-5 h-5" />
                    <span>Campaigns</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/events') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => navigate('/events')}
                  >
                    <Calendar className="w-5 h-5" />
                    <span>Events</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/analytics') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => navigate('/analytics')}
                  >
                    <PieChart className="w-5 h-5" />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/audience') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => navigate('/audience')}
                  >
                    <Lightbulb className="w-5 h-5" />
                    <span>Audience Insights</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/reports') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => navigate('/reports')}
                  >
                    <FileText className="w-5 h-5" />
                    <span>Reports</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/messages') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => navigate('/messages')}
                  >
                    <MessageSquare className="w-5 h-5" />
                    <span>Messages</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/import') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => navigate('/import')}
                  >
                    <Upload className="w-5 h-5" />
                    <span>Import Data</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    className={`flex items-center space-x-3 w-full py-2 px-3 rounded-lg ${isActive('/profile') ? 'bg-meta-lightBlue text-meta-blue font-medium' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => navigate('/profile')}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
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
