
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Facebook, Zap, CheckCircle } from 'lucide-react';

interface FacebookLoginButtonProps {
  onClick: () => void;
  isConnecting: boolean;
  advancedPermissions?: boolean;
  text?: string;
  recommended?: boolean;
}

const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({ 
  onClick, 
  isConnecting, 
  advancedPermissions = false,
  text = 'Continue with Facebook',
  recommended = true
}) => {
  return (
    <div className="w-full">
      {recommended && (
        <div className="flex items-center justify-center mb-2">
          <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
          <span className="text-xs text-green-600 font-medium">Recommended to avoid CORS issues</span>
        </div>
      )}
      <Button 
        className={`w-full ${recommended ? 'bg-[#1877F2] hover:bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}`}
        onClick={onClick}
        size="lg"
        disabled={isConnecting}
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting with Facebook...
          </>
        ) : (
          <>
            {advancedPermissions ? <Zap className="mr-2 h-4 w-4" /> : <Facebook className="mr-2 h-4 w-4" />}
            {text}
          </>
        )}
      </Button>
    </div>
  );
};

export default FacebookLoginButton;
