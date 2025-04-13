
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

export function useMetaIntegration() {
  const [activeTab, setActiveTab] = useState('accounts');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated, checkAuth } = useMetaConnection();

  // Ensure we have the proper authentication state by checking the token directly
  const ensureAuthState = useCallback(() => {
    const token = metaAuthService.getAccessToken();
    const directAuthCheck = token && token.length >= 50;
    
    console.log('useMetaIntegration - Auth check:', 
      directAuthCheck ? 'Authenticated' : 'Not authenticated',
      'Context state:', isAuthenticated ? 'Authenticated' : 'Not authenticated'
    );
    
    // Force context refresh if there's a mismatch
    if (directAuthCheck !== isAuthenticated) {
      console.log('Auth state mismatch in useMetaIntegration, refreshing...');
      checkAuth();
    }
    
    return directAuthCheck;
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get('tab');
    if (tab && ['accounts', 'flow', 'settings', 'diagnostics'].includes(tab)) {
      setActiveTab(tab);
    }
    
    // Always verify authentication state on mount
    ensureAuthState();
  }, [ensureAuthState]);

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

  // Use direct token check as the source of truth
  const effectiveIsAuthenticated = ensureAuthState();

  return {
    activeTab,
    isAuthenticated: effectiveIsAuthenticated, // Use the direct check result
    isRefreshing,
    handleDisconnect,
    handleRefresh,
    handleTabChange
  };
}
