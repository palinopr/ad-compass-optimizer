
import React from 'react';
import { Card } from '@/components/ui/card';
import { ErrorState } from '../CampaignListStates';
import CampaignLoadingTroubleshooter from '@/components/meta/CampaignLoadingTroubleshooter';

interface ErrorViewProps {
  error: any;
  errorDetails: any;
  effectiveIsAuthenticated: boolean;
  onRetry: () => void;
}

export const ErrorView: React.FC<ErrorViewProps> = ({
  error,
  errorDetails,
  effectiveIsAuthenticated,
  onRetry
}) => {
  // Check if error is specifically a 403 permission error
  const isPermissionError = 
    (errorDetails?.status === 403) || 
    (typeof error === 'string' && error.includes('permission')) ||
    (errorDetails?.code === 190) || 
    (errorDetails?.code === 200);

  // If we have a permission/auth error, show the troubleshooter instead
  if (isPermissionError) {
    return (
      <CampaignLoadingTroubleshooter 
        errorDetails={errorDetails}
        onRetry={onRetry}
      />
    );
  }
  
  return (
    <Card>
      <ErrorState 
        error={error}
        onRetry={onRetry}
        errorDetails={errorDetails}
        isAuthenticated={effectiveIsAuthenticated}
      />
    </Card>
  );
};

export default ErrorView;
