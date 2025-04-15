
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface MetaApiErrorProps {
  error: any;
  hideRawResponse?: boolean;
}

const MetaApiError: React.FC<MetaApiErrorProps> = ({ error, hideRawResponse }) => {
  if (!error) return null;

  const metaError = error.error || error;
  const hasMetaApiDetails = metaError.code || metaError.type || metaError.error_subcode;

  return (
    <Card className="p-4 space-y-4">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error.message || 'Campaign fetch failed'}
        </AlertDescription>
      </Alert>

      {hasMetaApiDetails && (
        <div className="space-y-2 text-sm">
          <h4 className="font-semibold">Meta API Error Details:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {metaError.code && (
              <div className="contents">
                <span className="text-muted-foreground">Error Code:</span>
                <span>{metaError.code}</span>
              </div>
            )}
            {metaError.type && (
              <div className="contents">
                <span className="text-muted-foreground">Error Type:</span>
                <span>{metaError.type}</span>
              </div>
            )}
            {metaError.error_subcode && (
              <div className="contents">
                <span className="text-muted-foreground">Subcode:</span>
                <span>{metaError.error_subcode}</span>
              </div>
            )}
          </div>
          {metaError.message && (
            <div className="mt-2">
              <span className="text-muted-foreground">Message:</span>
              <p className="mt-1 p-2 bg-muted rounded-md">{metaError.message}</p>
            </div>
          )}
        </div>
      )}

      {!hideRawResponse && (
        <details className="text-xs">
          <summary className="cursor-pointer text-muted-foreground">Show Raw Response</summary>
          <pre className="mt-2 p-2 bg-muted rounded-md overflow-auto max-h-48">
            {JSON.stringify(error, null, 2)}
          </pre>
        </details>
      )}
    </Card>
  );
};

export default MetaApiError;
