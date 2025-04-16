
import React from 'react';
import { Card } from '@/components/ui/card';
import { ErrorState } from '../CampaignListStates';

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
