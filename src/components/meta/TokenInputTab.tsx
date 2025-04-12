
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { AlertCircle, ExternalLink, Key, Loader2, Info } from 'lucide-react';
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
  
  const [tokenFormatValid, setTokenFormatValid] = useState<boolean | null>(null);

  // Validate token format as user types
  useEffect(() => {
    if (!manualToken || manualToken.trim().length === 0) {
      setTokenFormatValid(null);
      return;
    }
    
    const token = manualToken.trim();
    
    // Basic format validation
    if (token.length < 20) {
      setTokenFormatValid(false);
      return;
    }
    
    const tokenRegex = /^[A-Za-z0-9_-]+$/;
    setTokenFormatValid(tokenRegex.test(token));
  }, [manualToken]);

  const handleManualTokenConnect = () => {
    // Basic validation before attempting connection
    if (!manualToken || manualToken.trim().length < 20) {
      onTokenError("Please enter a valid Meta access token. Tokens are typically at least 20 characters long.");
      return;
    }

    const selectedPermissions = Object.entries(permissions)
      .filter(([_, isSelected]) => isSelected)
      .map(([permission]) => permission);
      
    connectWithToken(manualToken.trim(), selectedPermissions);
  };
  
  const handleTokenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Remove common formatting issues like extra spaces, quotes, etc.
    let cleanedValue = value
      .replace(/^['"]|['"]$/g, '') // Remove quotes at start/end
      .replace(/\s+/g, ''); // Remove all whitespace
      
    setManualToken(cleanedValue);
  };

  return (
    <div className="space-y-4 py-4">
      <p className="text-sm text-gray-500">
        For development with ad data, use a System User Access Token from Meta Business Settings.
      </p>
      
      {errorMessage && (
        <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md border border-red-200 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
      
      <div className="space-y-2">
        <label htmlFor="metaToken" className="text-sm font-medium flex items-center justify-between">
          <span>Access Token</span>
          {tokenFormatValid === false && manualToken.trim() !== '' && (
            <span className="text-xs text-red-500 flex items-center">
              <AlertCircle className="h-3 w-3 mr-1" />
              Invalid format
            </span>
          )}
          {tokenFormatValid === true && (
            <span className="text-xs text-green-500 flex items-center">
              Format looks valid
            </span>
          )}
        </label>
        <Input
          id="metaToken"
          value={manualToken}
          onChange={handleTokenChange}
          placeholder="Enter your Meta access token"
          type="password"
          className={tokenFormatValid === false ? "border-red-300" : ""}
        />
        <p className="text-xs text-muted-foreground">
          Paste the entire token without quotes or extra spaces
        </p>
      </div>
      
      <div className="rounded-md bg-blue-50 p-3 flex">
        <Info className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
        <div className="text-xs text-blue-700">
          <p className="font-medium mb-1">Token Troubleshooting:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Make sure to copy the entire token</li>
            <li>Remove any quotes or spaces</li>
            <li>System User tokens are long-lived (up to 60 days)</li>
            <li>User tokens expire in hours and aren't recommended</li>
          </ul>
        </div>
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
      
      <Button 
        onClick={handleManualTokenConnect}
        className="w-full"
        disabled={isConnecting || !manualToken.trim() || tokenFormatValid === false}
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
