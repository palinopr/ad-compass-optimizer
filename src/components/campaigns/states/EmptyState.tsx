
import React from 'react';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  adAccountId?: string | null;
  errorDetails?: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = "📭",
  title, 
  description,
  adAccountId,
  errorDetails
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center text-center space-y-3">
        <span className="text-4xl" role="img" aria-label="empty state icon">
          {icon}
        </span>
        <h3 className="text-lg font-medium text-gray-900">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          {description}
        </p>
        {adAccountId && (
          <div className="mt-2 text-xs text-muted-foreground">
            <p>Ad Account: {adAccountId}</p>
          </div>
        )}
        {errorDetails && errorDetails.code && (
          <div className="mt-2 text-xs text-muted-foreground bg-gray-50 p-2 rounded w-full max-w-md">
            <p>Error code: {errorDetails.code} {errorDetails.subcode ? `(${errorDetails.subcode})` : ''}</p>
            {errorDetails.message && <p className="mt-1">{errorDetails.message}</p>}
          </div>
        )}
      </div>
    </Card>
  );
};

export default EmptyState;
