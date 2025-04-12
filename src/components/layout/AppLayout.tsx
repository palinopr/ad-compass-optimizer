import React, { useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import MetaConnectionDialog from '@/components/meta/MetaConnectionDialog';
import { metaAuthService } from '@/services/MetaAuthService';
import { useLocation, useNavigate } from 'react-router-dom';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated, checkAuth } = useMetaConnection();
  const [showConnectDialog, setShowConnectDialog] = React.useState(false);
  const [connectionChecked, setConnectionChecked] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();

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
    
    // Check if we need to redirect based on auth status
    // Only redirect on certain pages that require authentication
    const authRequiredPages = ['/campaigns', '/messages'];
    if (!isAuthenticated && 
        authRequiredPages.some(page => location.pathname.startsWith(page)) && 
        connectionChecked) {
      console.log('Authentication required for this page, showing dialog...');
      setShowConnectDialog(true);
    }
  }, [isAuthenticated, checkAuth, location.pathname, connectionChecked]);

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
          event.key === 'meta_access_token' || 
          event.key === 'meta_token_timestamp' ||
          event.key === 'meta_auth_valid')) {
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
    
    // Store user data in localStorage for persistence
    if (userData.name) {
      localStorage.setItem('meta_user_name', userData.name);
    }
    
    checkAuth(); // Immediately check auth status after successful connection
    
    // Clear any cached connection status to force re-check
    localStorage.removeItem('meta_connection_status_checked');
    
    // If we're on a route that requires auth, stay there
    // Otherwise, navigate to campaigns which is likely what people want to see
    const authRequiredPages = ['/campaigns', '/messages'];
    if (!authRequiredPages.some(page => location.pathname.startsWith(page))) {
      navigate('/campaigns');
    }
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
