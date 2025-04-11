
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, Key, Loader2 } from 'lucide-react';
import { useMetaTokenConnection } from '@/hooks/useMetaTokenConnection';
import { Checkbox } from '@/components/ui/checkbox';

interface TokenInputTabProps {
  onTokenSuccess: (userData: any) => void;
  onTokenError: (errorMessage: string) => void;
}

const TokenInputTab: React.FC<TokenInputTabProps> = ({ onTokenSuccess, onTokenError }) => {
  const { 
    manualToken, 
    setManualToken, 
    isConnecting, 
    errorMessage, 
    connectWithToken 
  } = useMetaTokenConnection({
    onSuccess: onTokenSuccess,
    onError: onTokenError
  });
  
  const [permissions, setPermissions] = useState({
    ads_management: true,
    ads_read: true,
    read_insights: true
  });

  const handleManualTokenConnect = () => {
    const selectedPermissions = Object.entries(permissions)
      .filter(([_, isSelected]) => isSelected)
      .map(([permission]) => permission);
      
    connectWithToken(manualToken, selectedPermissions);
  };

  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-gray-500">
        For development with ad data, use a System User Access Token from Meta Business Settings.
      </p>
      
      {errorMessage && (
        <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
          {errorMessage}
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="metaToken" className="text-sm font-medium">Access Token</label>
        <Input
          id="metaToken"
          value={manualToken}
          onChange={(e) => setManualToken(e.target.value)}
          placeholder="Enter your Meta access token"
          type="password"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Permissions</label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="ads_management" 
              checked={permissions.ads_management}
              onCheckedChange={(checked) => 
                setPermissions({...permissions, ads_management: checked === true})
              }
            />
            <label htmlFor="ads_management" className="text-sm">ads_management</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="ads_read" 
              checked={permissions.ads_read}
              onCheckedChange={(checked) => 
                setPermissions({...permissions, ads_read: checked === true})
              }
            />
            <label htmlFor="ads_read" className="text-sm">ads_read</label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="read_insights" 
              checked={permissions.read_insights}
              onCheckedChange={(checked) => 
                setPermissions({...permissions, read_insights: checked === true})
              }
            />
            <label htmlFor="read_insights" className="text-sm">read_insights</label>
          </div>
        </div>
      </div>
      
      <div className="flex items-start space-x-2 text-xs text-gray-500">
        <AlertCircle className="h-4 w-4 mt-0.5" />
        <span>
          Make sure your token has the permissions you selected above. Tokens with incorrect permissions will cause API errors.
        </span>
      </div>
      
      <Button 
        onClick={handleManualTokenConnect}
        className="w-full"
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Key className="mr-2 h-4 w-4" />
            Connect with Token
          </>
        )}
      </Button>
      
      <div className="text-center mt-4">
        <a 
          href="https://developers.facebook.com/docs/marketing-api/system-users" 
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-600 hover:underline flex items-center justify-center"
        >
          Learn about System Users
          <ExternalLink className="h-3 w-3 ml-1" />
        </a>
      </div>
    </div>
  );
};

export default TokenInputTab;
