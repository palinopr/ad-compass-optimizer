
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LastMetaErrorProps {
  lastMetaError: {
    timestamp: string;
    error: string;
    context: {
      shouldReconnect: boolean;
      tokenPresent: boolean;
      mockMode: boolean;
    };
    rawError?: any;
  } | null;
}

const LastMetaError: React.FC<LastMetaErrorProps> = ({ lastMetaError }) => {
  if (!lastMetaError) return null;

  return (
    <Card className="mt-4 border-amber-200 bg-amber-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-800 flex items-center text-lg">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Last Meta API Error
        </CardTitle>
        <div className="text-sm text-amber-700">
          {new Date(lastMetaError.timestamp).toLocaleString()}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="bg-white rounded-md p-3 overflow-auto border text-sm">
            <div className="font-medium mb-2">Error Message:</div>
            <div className="text-red-600">{lastMetaError.error}</div>
            
            <div className="font-medium mt-4 mb-2">Context:</div>
            <div className="text-gray-600">
              <div>Should Reconnect: {lastMetaError.context.shouldReconnect ? 'Yes' : 'No'}</div>
              <div>Token Present: {lastMetaError.context.tokenPresent ? 'Yes' : 'No'}</div>
              <div>Mock Mode: {lastMetaError.context.mockMode ? 'Yes' : 'No'}</div>
            </div>
            
            {lastMetaError.rawError && (
              <>
                <div className="font-medium mt-4 mb-2">Raw Error:</div>
                <pre className="text-xs whitespace-pre-wrap break-words text-gray-600">
                  {JSON.stringify(lastMetaError.rawError, null, 2)}
                </pre>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LastMetaError;
