
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MetaLimitedAccessWarningProps {
  onRefreshToken: () => void;
}

const MetaLimitedAccessWarning: React.FC<MetaLimitedAccessWarningProps> = ({ 
  onRefreshToken 
}) => {
  return (
    <Alert variant="warning" className="mb-4 bg-yellow-50 border-yellow-200">
      <AlertTriangle className="h-4 w-4 text-yellow-800" />
      <AlertTitle className="text-yellow-800">Limited Meta Access</AlertTitle>
      <AlertDescription>
        <p className="text-yellow-700 mb-2">
          Your token has limited permissions. You can access campaign data, but profile information is restricted.
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRefreshToken} 
          className="mt-2 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
        >
          Update Permissions
        </Button>
      </AlertDescription>
    </Alert>
  );
};

export default MetaLimitedAccessWarning;
