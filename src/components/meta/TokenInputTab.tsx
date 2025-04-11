
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';
import { AlertCircle, ExternalLink, Key, Loader2 } from 'lucide-react';

interface TokenInputTabProps {
  onTokenSuccess: (userData: any) => void;
}

const TokenInputTab: React.FC<TokenInputTabProps> = ({ onTokenSuccess }) => {
  const [manualToken, setManualToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${token}`
      );
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error.message || 'Failed to fetch user data');
      }
      
      return {
        name: data.name,
        email: data.email,
        picture: data.picture?.data.url
      };
    } catch (error) {
      console.error('Error fetching user data:', error);
      setErrorMessage(`Authentication error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const handleManualTokenConnect = async () => {
    if (!manualToken.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid access token",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);
    setErrorMessage(null);
    
    try {
      // Store the token
      metaAuthService.storeAccessToken(manualToken, 'manual_token_user');
      
      // Test the token by fetching user data
      const userData = await fetchUserData(manualToken);
      onTokenSuccess(userData);
      
      toast({
        title: "Connected Successfully",
        description: "Your Meta access token has been connected successfully."
      });
    } catch (error) {
      console.error('Error with manual token:', error);
      metaAuthService.logout();
      toast({
        title: "Connection Failed",
        description: "The provided access token is invalid or has expired.",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
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
      
      <div className="flex items-start space-x-2 text-xs text-gray-500">
        <AlertCircle className="h-4 w-4 mt-0.5" />
        <span>
          Generate a token in Meta Business Settings under System Users. 
          For testing ad data, the token should have ads_read permission.
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
