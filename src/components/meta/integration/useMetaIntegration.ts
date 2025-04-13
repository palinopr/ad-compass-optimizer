
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

export function useMetaIntegration() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, checkAuth } = useMetaConnection();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['accounts', 'flow', 'settings', 'diagnostics'].includes(tab)) {
      setActiveTab(tab);
    }
  }, []);

  const handleDisconnect = () => {
    metaAuthService.logout();
    checkAuth();
    
    toast({
      title: "Disconnected",
      description: "Your Meta account has been disconnected."
    });
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    
    setTimeout(() => {
      checkAuth();
      setIsRefreshing(false);
      
      toast({
        title: "Refreshed",
        description: "Connection status has been refreshed."
      });
    }, 500);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', value);
    window.history.pushState({}, '', url);
  };

  return {
    activeTab,
    isAuthenticated,
    isRefreshing,
    handleDisconnect,
    handleRefresh,
    handleTabChange
  };
}
