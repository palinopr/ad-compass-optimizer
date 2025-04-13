
import { useState, useEffect } from 'react';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';

export function useCampaignsPage() {
  const [activeTab, setActiveTab] = useState('campaigns');
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const { isAuthenticated, hasPermissions, userData, checkAuth } = useMetaConnection();
  
  useEffect(() => {
    // Force check auth status when component mounts
    checkAuth();
    
    // Check if we should show the connection dialog (set by the ErrorState component)
    const shouldShowConnection = localStorage.getItem('show_meta_connection') === 'true';
    if (shouldShowConnection) {
      console.log('Showing Meta connection dialog due to stored flag');
      setShowConnectionDialog(true);
      localStorage.removeItem('show_meta_connection');
    }
  }, [checkAuth]);
  
  // Check if ad account is selected
  const hasAdAccount = () => {
    const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
    return selectedAdAccounts && JSON.parse(selectedAdAccounts).length > 0;
  };
  
  const handleConnectionSuccess = (userData: any) => {
    console.log('Connection successful, user data:', userData);
    checkAuth(); // Update the connection state
    setShowConnectionDialog(false);
  };
  
  const handleConnectionError = () => {
    // Just close the dialog but don't update auth state
    setShowConnectionDialog(false);
  };

  return {
    activeTab,
    setActiveTab,
    showCreateWizard,
    setShowCreateWizard,
    showConnectionDialog,
    setShowConnectionDialog,
    isAuthenticated,
    hasPermissions,
    hasAdAccount: hasAdAccount(),
    handleConnectionSuccess,
    handleConnectionError
  };
}
