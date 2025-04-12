
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw, AlertCircle, PlusCircle, ShieldAlert } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';
import { MetaApiService } from '@/services/MetaApiService';

interface EmptyStateProps {
  status: 'active' | 'draft' | 'archived';
}

interface ErrorStateProps {
  error: string;
  isAuthenticated: boolean;
  onRetry?: () => void;
  errorDetails?: any;
}

export const LoadingState = () => (
  <CardContent className="flex flex-col items-center justify-center py-8">
    <Loader2 className="w-6 h-6 text-meta-blue animate-spin mb-2" />
    <p className="text-muted-foreground">Loading campaigns...</p>
  </CardContent>
);

export const ErrorState: React.FC<ErrorStateProps> = ({ 
  error, 
  isAuthenticated,
  onRetry,
  errorDetails
}) => {
  const { toast } = useToast();
  
  // Parse the error message to provide better guidance
  const isTokenError = error.toLowerCase().includes('token') || 
    error.includes('400') || 
    error.includes('401') || 
    error.includes('expired') || 
    error.includes('invalid');
    
  const isPermissionError = error.toLowerCase().includes('permission') || 
    error.includes('403') || 
    error.includes('ads_read');
    
  const isAccountError = error.toLowerCase().includes('account') || 
    error.toLowerCase().includes('no ad account');
    
  const isFacebookAuth = metaAuthService.getTokenSource() === 'facebook';
  
  const handleReconnect = async () => {
    // Validate current token before logout
    const token = metaAuthService.getAccessToken();
    if (token) {
      const connectionTest = await MetaApiService.testConnection(token);
      // If token is actually valid, maybe it's another issue
      if (connectionTest.success) {
        toast({
          title: "Token Validation",
          description: "Your token seems valid. The issue may be with permissions or the ad account. Trying to refresh connection.",
        });
      }
    }
    
    // Clear token and all Meta-related data
    console.log('User clicked reconnect button - clearing Meta auth data and redirecting to connection flow');
    metaAuthService.logout();
    
    toast({
      title: "Reconnection Required",
      description: "Please reconnect your Meta account with all required permissions."
    });
    
    // Set a flag to show the connection dialog on campaigns page
    localStorage.setItem('show_meta_connection', 'true');
    localStorage.setItem('meta_connection_context', isPermissionError ? 'permissions' : 'token');
    
    // Add a short delay so the toast is visible before reload
    setTimeout(() => {
      // For campaign page, just reload to trigger fresh authentication flow
      window.location.reload();
    }, 500);
  };
  
  return (
    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
      <p className="text-red-500 font-medium mb-2">{error}</p>
      
      {isFacebookAuth && (
        <div className="mb-4 bg-amber-50 border border-amber-200 p-3 rounded-md">
          <p className="flex items-start text-sm text-amber-800">
            <ShieldAlert className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            <span>You're using Facebook authentication which should bypass CORS issues, but campaign loading is still failing. This usually indicates an issue with ad account access or permissions.</span>
          </p>
        </div>
      )}
      
      <p className="text-muted-foreground mb-4 max-w-md">
        {isTokenError ? (
          "Your Meta access token appears to be invalid or expired. Please reconnect your Meta account with a valid token."
        ) : isPermissionError ? (
          "You don't have the required permissions to access this campaign data. Please reconnect with ads_read or ads_management permissions."
        ) : isAccountError ? (
          "Please select an ad account to view campaign data."
        ) : (
          "Please check your connection settings and try again."
        )}
      </p>
      
      {errorDetails && (
        <div className="mb-4 text-xs bg-gray-50 p-2 rounded border border-gray-200 max-w-md overflow-auto text-left">
          <p className="font-medium mb-1">Additional details:</p>
          <pre className="whitespace-pre-wrap">{
            typeof errorDetails === 'object' 
              ? JSON.stringify(errorDetails, null, 2) 
              : errorDetails
          }</pre>
        </div>
      )}
      
      <div className="flex gap-3">
        {(isTokenError || isPermissionError || isFacebookAuth) && (
          <Button 
            className="bg-meta-blue hover:bg-meta-dark" 
            onClick={handleReconnect}
          >
            Reconnect Meta Account
          </Button>
        )}
        
        {onRetry && !isTokenError && (
          <Button 
            variant="outline"
            onClick={onRetry}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    </CardContent>
  );
};

export const EmptyState = ({ status }: EmptyStateProps) => (
  <CardContent className="flex flex-col items-center justify-center py-8">
    <p className="text-muted-foreground mb-4">No {status} campaigns found.</p>
    {status === 'draft' && (
      <Button className="bg-meta-blue hover:bg-meta-dark">
        <PlusCircle className="mr-2 h-4 w-4" />
        Create New Campaign
      </Button>
    )}
  </CardContent>
);
