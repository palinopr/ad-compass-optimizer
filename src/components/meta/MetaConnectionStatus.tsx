
import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { useMetaConnection } from './SharedMetaConnectionProvider';
import { metaAuthService } from '@/services/MetaAuthService';
import { Button } from '@/components/ui/button';

const MetaConnectionStatus: React.FC = () => {
  const { isAuthenticated, hasPermissions, checkAuth } = useMetaConnection();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [adAccountSelected, setAdAccountSelected] = useState(false);
  
  // Check if we have selected ad accounts
  useEffect(() => {
    const checkAdAccounts = () => {
      const selectedAdAccount = localStorage.getItem('selected_ad_account');
      const selectedAdAccounts = localStorage.getItem('selected_ad_accounts');
      
      let hasSelected = false;
      
      if (selectedAdAccount) {
        hasSelected = true;
      } else if (selectedAdAccounts) {
        try {
          const accounts = JSON.parse(selectedAdAccounts);
          hasSelected = Array.isArray(accounts) && accounts.length > 0;
        } catch (e) {
          console.error('Error parsing selected ad accounts:', e);
        }
      }
      
      setAdAccountSelected(hasSelected);
    };
    
    // Initial check
    checkAdAccounts();
    
    // Set up a listener for storage changes to detect ad account selection changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'selected_ad_account' || event.key === 'selected_ad_accounts') {
        checkAdAccounts();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    checkAuth();
    
    // Cache status in localStorage for persistence
    localStorage.setItem('meta_connection_last_refresh', Date.now().toString());
    
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };
  
  // Get token freshness info
  const tokenInfo = metaAuthService.checkTokenFreshness();
  
  // Calculate overall status
  let status = 'disconnected';
  if (isAuthenticated) {
    if (hasPermissions) {
      status = adAccountSelected ? 'complete' : 'needs-account';
    } else {
      status = 'needs-permissions';
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className={`rounded-md p-4 flex items-center ${
        isAuthenticated ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
      }`}>
        {isAuthenticated ? (
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600 mr-3" />
        )}
        <div>
          <h3 className={`font-medium ${isAuthenticated ? 'text-green-700' : 'text-red-700'}`}>
            {isAuthenticated ? 'Connected to Meta' : 'Not Connected'}
          </h3>
          <p className="text-xs mt-1">
            {isAuthenticated 
              ? `Connected as ${localStorage.getItem('meta_user_name') || 'Meta User'}`
              : 'Please connect your Meta account to access campaigns'
            }
          </p>
        </div>
      </div>
      
      <div className={`rounded-md p-4 flex items-center ${
        hasPermissions ? 'bg-green-50 border border-green-200' : 
        (isAuthenticated ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200')
      }`}>
        {hasPermissions ? (
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
        ) : isAuthenticated ? (
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-gray-400 mr-3" />
        )}
        <div>
          <h3 className={`font-medium ${
            hasPermissions ? 'text-green-700' : 
            (isAuthenticated ? 'text-yellow-700' : 'text-gray-500')
          }`}>
            {hasPermissions 
              ? 'Ad Permissions Granted' 
              : (isAuthenticated ? 'Permissions Missing' : 'Permissions Required')
            }
          </h3>
          <p className="text-xs mt-1">
            {hasPermissions 
              ? 'You have all required permissions' 
              : (isAuthenticated 
                ? 'Your token needs ads_read and ads_management permissions' 
                : 'Connect to grant ad management permissions')
              }
          </p>
        </div>
      </div>
      
      <div className={`rounded-md p-4 flex items-center ${
        adAccountSelected ? 'bg-green-50 border border-green-200' : 
        (isAuthenticated ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50 border border-gray-200')
      }`}>
        {adAccountSelected ? (
          <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
        ) : isAuthenticated ? (
          <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
        ) : (
          <AlertTriangle className="h-5 w-5 text-gray-400 mr-3" />
        )}
        <div className="flex-1">
          <h3 className={`font-medium ${
            adAccountSelected ? 'text-green-700' : 
            (isAuthenticated ? 'text-yellow-700' : 'text-gray-500')
          }`}>
            {adAccountSelected 
              ? 'Ad Account Selected' 
              : (isAuthenticated ? 'Select Ad Account' : 'Ad Account Required')
            }
          </h3>
          <p className="text-xs mt-1">
            {adAccountSelected 
              ? 'Ready to manage campaigns' 
              : (isAuthenticated 
                ? 'Please select an ad account to continue' 
                : 'Connect to select an ad account')
              }
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh} 
          className="ml-2"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>
    </div>
  );
};

export default MetaConnectionStatus;
