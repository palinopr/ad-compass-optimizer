
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Home,
  BarChart2,
  Users,
  MessageSquare,
  Calendar,
  Settings,
  FileText,
  Tag,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Share2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isActive?: boolean;
  isCollapsed?: boolean;
  badge?: number | string;
}

const SidebarItem = ({ icon, label, href, isActive, isCollapsed, badge }: SidebarItemProps) => {
  return (
    <Link to={href}>
      <div
        className={cn(
          "flex items-center rounded-lg px-3 py-2 text-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800",
          isActive ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-50" : "text-slate-500 dark:text-slate-400"
        )}
      >
        <div className="mr-2 flex h-5 w-5 items-center justify-center">
          {icon}
        </div>
        {!isCollapsed && (
          <>
            <span className="flex-1">{label}</span>
            {badge !== undefined && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-800">
                {badge}
              </span>
            )}
          </>
        )}
      </div>
    </Link>
  );
};

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const location = useLocation();
  const { toast } = useToast();
  const { checkAuth } = useMetaConnection();

  const handleLogout = () => {
    metaAuthService.logout();
    checkAuth(); // Update the auth state
    toast({
      title: "Logged out",
      description: "You have been disconnected from Meta"
    });
  };

  const items = [
    { href: "/", label: "Dashboard", icon: <Home className="h-4 w-4" /> },
    { href: "/campaigns", label: "Campaigns", icon: <Tag className="h-4 w-4" /> },
    { href: "/analytics", label: "Analytics", icon: <BarChart2 className="h-4 w-4" /> },
    { href: "/audiences", label: "Audiences", icon: <Users className="h-4 w-4" /> },
    { href: "/events", label: "Events", icon: <Calendar className="h-4 w-4" /> },
    { href: "/messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" />, badge: 3 },
    { href: "/reports", label: "Reports", icon: <FileText className="h-4 w-4" /> },
    { href: "/meta-integration", label: "Meta Integration", icon: <Share2 className="h-4 w-4" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
  ];

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-white dark:bg-slate-950 h-screen transition-all duration-300",
        isCollapsed ? "w-16" : "w-56"
      )}
    >
      <div className="flex h-14 items-center px-3 border-b">
        {!isCollapsed && (
          <span className="font-bold text-xl pl-1 text-blue-600">
            AdManager
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className={cn("ml-auto h-8 w-8", isCollapsed && "mx-auto")}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-2 px-2">
        <div className="space-y-1">
          {items.map((item) => (
            <SidebarItem
              key={item.href}
              icon={item.icon}
              label={item.label}
              href={item.href}
              badge={item.badge}
              isActive={location.pathname === item.href}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>
      </div>
      <div className="mt-auto border-t p-2">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-slate-500 hover:text-slate-900",
            isCollapsed && "justify-center p-2"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {!isCollapsed && "Disconnect"}
        </Button>
      </div>
    </div>
  );
}
