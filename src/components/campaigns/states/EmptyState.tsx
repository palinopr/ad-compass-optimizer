
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  adAccountId?: string | null;
  errorDetails?: any;
  onRefresh?: () => void; // Add refresh callback
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon = "📭",
  title, 
  description,
  adAccountId,
  errorDetails,
  onRefresh
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
        {errorDetails && (errorDetails.code || errorDetails.message) && (
          <div className="mt-2 text-xs text-muted-foreground bg-gray-50 p-2 rounded w-full max-w-md">
            {errorDetails.code && <p>Error code: {errorDetails.code} {errorDetails.subcode ? `(${errorDetails.subcode})` : ''}</p>}
            {errorDetails.message && <p className="mt-1">{errorDetails.message}</p>}
            
            {/* Debug information for troubleshooting */}
            {process.env.NODE_ENV !== 'production' && errorDetails.debug && (
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-500">Debug Info</summary>
                <pre className="text-left bg-gray-100 p-2 rounded mt-1 overflow-x-auto text-xs">
                  {JSON.stringify(errorDetails.debug, null, 2)}
                </pre>
              </details>
            )}
          </div>
        )}
        
        {onRefresh && (
          <Button 
            variant="outline" 
            onClick={onRefresh}
            className="mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>
    </Card>
  );
};

export default EmptyState;
