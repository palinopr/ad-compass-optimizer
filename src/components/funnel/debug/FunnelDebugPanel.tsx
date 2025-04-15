
import React from 'react';
import { Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';

interface FunnelDebugPanelProps {
  lastRequestDetails: any;
  isLoading: boolean;
  testDirectApiCall: () => Promise<void>;
  verifyPermissions: () => Promise<void>;
  buildVersion: string;
}

const FunnelDebugPanel: React.FC<FunnelDebugPanelProps> = ({
  lastRequestDetails,
  isLoading,
  testDirectApiCall,
  verifyPermissions,
  buildVersion
}) => {
  return (
    <div className="mb-4 bg-gray-50 p-4 rounded-md border border-gray-200">
      <h3 className="text-sm font-medium mb-2">Debug Tools</h3>
      <div className="flex space-x-2">
        <Button 
          variant="secondary" 
          size="sm"
          onClick={testDirectApiCall}
          disabled={isLoading}
        >
          Test API Connection
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={verifyPermissions}
        >
          Verify Permissions
        </Button>
      </div>
      
      {lastRequestDetails && (
        <div className="mt-3 text-xs text-gray-600">
          <div><strong>Last request:</strong> {lastRequestDetails.endpoint}</div>
          <div><strong>Account ID:</strong> {lastRequestDetails.accountId}</div>
          <div><strong>Timestamp:</strong> {new Date(lastRequestDetails.timestamp).toLocaleTimeString()}</div>
          <div><strong>Token length:</strong> {lastRequestDetails.tokenLength} characters</div>
          <div><strong>Date preset:</strong> last_28d (forced)</div>
        </div>
      )}
    </div>
  );
};

export default FunnelDebugPanel;
