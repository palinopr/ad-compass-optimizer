import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import MetaConnectionDialog from '@/components/meta/MetaConnectionDialog';
import { metaAuthService } from '@/services/MetaAuthService';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated, checkAuth } = useMetaConnection();
  const [showConnectDialog, setShowConnectDialog] = React.useState(false);
  const [connectionChecked, setConnectionChecked] = React.useState(false);

  // First effect: Initial load and connection check
  useEffect(() => {
    console.log('Checking Meta auth status...');
    
    // Check if token exists but was not recognized yet
    const token = metaAuthService.getAccessToken();
    if (token && !isAuthenticated) {
      console.log('Token exists but not authenticated yet, triggering check...');
      checkAuth();
    }

    // Mark connection as checked
    setConnectionChecked(true);

    // Check if we need to show connection dialog based on localStorage flag
    const needsConnection = localStorage.getItem('show_meta_connection') === 'true';
    if (needsConnection && !isAuthenticated) {
      setShowConnectDialog(true);
      localStorage.removeItem('show_meta_connection');
    }
  }, [isAuthenticated, checkAuth]);

  // Second effect: Add visibility change listener to detect tab focus/return
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab is now visible, checking auth status...');
        checkAuth();
      }
    };

    // Add event listener for visibility change (tab switching)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add event listener for storage changes (for cross-tab synchronization)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && (
          event.key === MetaAuthService.TOKEN_KEY || 
          event.key === MetaAuthService.TOKEN_TIMESTAMP_KEY)) {
        console.log('Storage changed, checking auth status...');
        checkAuth();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [checkAuth]);

  const handleConnectionSuccess = (userData: any) => {
    console.log('Connection successful:', userData);
    setShowConnectDialog(false);
    checkAuth(); // Immediately check auth status after successful connection
  };

  const handleConnectionError = (errorMessage: string) => {
    console.error('Connection error:', errorMessage);
    // Keep dialog open on error
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
      
      {/* Meta Connection Dialog */}
      <MetaConnectionDialog
        open={showConnectDialog}
        onOpenChange={setShowConnectDialog}
        onSuccess={handleConnectionSuccess}
        onError={handleConnectionError}
      />
    </div>
  );
};

export default AppLayout;
