
import React from 'react';
import { Button } from '@/components/ui/button';
import { CardContent } from '@/components/ui/card';
import { Loader2, RefreshCw, AlertCircle, PlusCircle } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';

interface EmptyStateProps {
  status: 'active' | 'draft' | 'archived';
}

interface ErrorStateProps {
  error: string;
  isAuthenticated: boolean;
  onRetry?: () => void;
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
  onRetry
}) => {
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
  
  return (
    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
      <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
      <p className="text-red-500 font-medium mb-2">{error}</p>
      
      <p className="text-muted-foreground mb-4 max-w-md">
        {isTokenError ? (
          "Your Meta access token appears to be invalid or expired. Please reconnect your Meta account."
        ) : isPermissionError ? (
          "You don't have the required permissions to access this campaign data. Please update your Meta connection with ads_read or ads_management permissions."
        ) : isAccountError ? (
          "Please select an ad account to view campaign data."
        ) : (
          "Please check your connection settings and try again."
        )}
      </p>
      
      <div className="flex gap-3">
        {!isAuthenticated && (
          <Button className="bg-meta-blue hover:bg-meta-dark" onClick={() => window.location.reload()}>
            Connect Meta Account
          </Button>
        )}
        
        {onRetry && (
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
