
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Facebook } from 'lucide-react';

interface FacebookLoginButtonProps {
  onClick: () => void;
  isConnecting: boolean;
}

const FacebookLoginButton: React.FC<FacebookLoginButtonProps> = ({ onClick, isConnecting }) => {
  return (
    <Button 
      className="w-full bg-[#1877F2] hover:bg-blue-600 text-white"
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
          <Facebook className="mr-2 h-4 w-4" />
          Continue with Facebook
        </>
      )}
    </Button>
  );
};

export default FacebookLoginButton;
