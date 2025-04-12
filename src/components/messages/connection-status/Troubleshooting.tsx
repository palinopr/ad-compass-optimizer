
import React from 'react';
import { Link2Off, AlertCircle, RefreshCw, Facebook } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TroubleshootingProps {
  tokenExists: boolean;
  onRetryConnection?: () => void;
  onConnectWithBrowser?: () => void;
}

const Troubleshooting: React.FC<TroubleshootingProps> = ({
  tokenExists,
  onRetryConnection,
  onConnectWithBrowser
}) => {
  return (
    <div className="border-t pt-3 mt-2">
      <h4 className="text-sm font-medium mb-2">Troubleshooting</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <Link2Off className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
          <span className="text-gray-700">
            Not connected to Meta API. Visit the <a href="/meta-integration" className="text-blue-600 underline">Meta Integration page</a> to connect.
          </span>
        </div>
        <div className="flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-gray-500 mt-0.5" />
          <span className="text-gray-700">
            Token status: {tokenExists ? "Found but invalid" : "Not found"}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 mt-3">
          {onRetryConnection && (
            <Button 
              onClick={onRetryConnection} 
              variant="outline" 
              size="sm" 
              className="w-full"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Retry Connection
            </Button>
          )}
          
          {onConnectWithBrowser && (
            <Button 
              onClick={onConnectWithBrowser}
              variant="default" 
              size="sm"
              className="w-full bg-meta-blue hover:bg-meta-dark"
            >
              <Facebook className="h-3.5 w-3.5 mr-1.5" />
              Connect with Browser
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Troubleshooting;
