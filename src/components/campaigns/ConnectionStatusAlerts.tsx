
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Info, 
  AlertCircle,
  ShieldAlert,
  ExternalLink 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ConnectionStatusAlertsProps {
  isAuthenticated: boolean;
  hasPermissions: boolean;
  hasAdAccount: boolean;
}

const ConnectionStatusAlerts: React.FC<ConnectionStatusAlertsProps> = ({
  isAuthenticated,
  hasPermissions,
  hasAdAccount
}) => {
  if (!isAuthenticated) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Connect your Meta account to access campaign features.</span>
          <Link to="/meta-integration">
            <Button variant="outline" size="sm" className="ml-4 flex items-center gap-1">
              Manage Integrations
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!hasPermissions) {
    return (
      <Alert variant="destructive">
        <ShieldAlert className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>You don't have the necessary permissions to access ad campaigns.</span>
          <Link to="/meta-integration">
            <Button variant="outline" size="sm" className="ml-4 flex items-center gap-1">
              Configure Permissions
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }
  
  if (!hasAdAccount) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>Please select an ad account to view and manage campaigns.</span>
          <Link to="/meta-integration">
            <Button variant="outline" size="sm" className="ml-4 flex items-center gap-1">
              Select Ad Account
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert className="bg-blue-50 border-blue-200">
      <Info className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-700">
        Viewing campaigns from your Meta ad account. Campaign creation through the API requires extra permissions.
      </AlertDescription>
    </Alert>
  );
};

export default ConnectionStatusAlerts;

// Need to import Button which was used but not imported
import { Button } from '@/components/ui/button';
