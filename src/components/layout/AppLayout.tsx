
import React, { useEffect, useState, useRef } from 'react';
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
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectionChecked, setConnectionChecked] = useState(false);
  const [alreadyAuthenticated, setAlreadyAuthenticated] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use a ref to prevent multiple checks on mount
  const initialCheckDoneRef = useRef(false);
  // Use a ref to prevent dialog auto-opening too often
  const lastDialogTimeRef = useRef(0);

  // First effect: Initial load and connection check - ONCE only
  useEffect(() => {
    if (initialCheckDoneRef.current) {
      return; // Only run this effect once
    }
    
    console.log('Checking Meta auth status on AppLayout mount...');
    initialCheckDoneRef.current = true;
    
    // Always use direct token check which is most reliable
    const token = metaAuthService.getAccessToken();
    const directAuthCheck = token && token.length >= 50;
    
    // If token exists but state doesn't match, trigger auth check
    if (directAuthCheck !== isAuthenticated) {
      console.log('Token exists but auth state mismatch, triggering check...');
      checkAuth();
    }

    // Track if we were already authenticated when the component mounted
    setAlreadyAuthenticated(directAuthCheck);

    // Mark connection as checked
    setConnectionChecked(true);
    
    // Clear any stale connection flags after successful mount
    if (directAuthCheck) {
      localStorage.removeItem('show_meta_connection');
      sessionStorage.removeItem('show_meta_connection');
    }
  }, [isAuthenticated, checkAuth]);

  // Second effect: Handle showing connection dialog
  useEffect(() => {
    // Only check for showing dialog if we've completed the initial check
    if (!connectionChecked) return;
    
    // Always check token directly for most reliable result
    const token = metaAuthService.getAccessToken();
    const effectiveIsAuthenticated = token && token.length >= 50;
    
    // Check if we need to show connection dialog based on localStorage flag
    const needsConnection = localStorage.getItem('show_meta_connection') === 'true';
    
    // Rate limit showing the dialog
    const now = Date.now();
    const timeSinceLastDialog = now - lastDialogTimeRef.current;
    const shouldRateLimit = timeSinceLastDialog < 10000; // Don't show dialog more than once every 10 seconds
    
    // Check if we need to redirect based on auth status
    // Only redirect on certain pages that require authentication
    const authRequiredPages = ['/campaigns', '/messages'];
    const needsAuthForCurrentPage = authRequiredPages.some(page => location.pathname.startsWith(page));
    
    // Only show the dialog if:
    // 1. We're not already authenticated based on direct token check, AND
    // 2. Either there's a flag set OR we're on an auth-required page
    // 3. And we're not rate limiting
    if (!effectiveIsAuthenticated && (needsConnection || needsAuthForCurrentPage) && !shouldRateLimit) {
      console.log('Authentication required, showing dialog...');
      setShowConnectDialog(true);
      lastDialogTimeRef.current = now;
      // Clear the flag once we've decided to show the dialog
      localStorage.removeItem('show_meta_connection');
      sessionStorage.removeItem('show_meta_connection');
    } else if (effectiveIsAuthenticated) {
      // Make sure dialog is hidden if we're authenticated
      setShowConnectDialog(false);
    }
  }, [isAuthenticated, connectionChecked, location.pathname]);

  const handleConnectionSuccess = (userData: any) => {
    console.log('Connection successful:', userData);
    setShowConnectDialog(false);
    
    // Store user data in localStorage for persistence
    if (userData.name) {
      localStorage.setItem('meta_user_name', userData.name);
    }
    
    // Add a delay before checking auth to ensure token is properly stored
    setTimeout(() => {
      console.log('Checking auth status after successful connection');
      checkAuth();
    }, 1000);
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
