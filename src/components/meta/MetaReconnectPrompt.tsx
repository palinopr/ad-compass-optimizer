
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import SystemUserTokenGuide from './SystemUserTokenGuide';

interface MetaReconnectPromptProps {
  errorMessage: string;
  onReconnect: () => void;
}

const MetaReconnectPrompt: React.FC<MetaReconnectPromptProps> = ({ 
  errorMessage, 
  onReconnect 
}) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4 my-4">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
        <div>
          <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
          <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
          <div className="mt-3">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={onReconnect}
            >
              Reconnect Meta Account
            </Button>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <SystemUserTokenGuide />
      </div>
    </div>
  );
};

export default MetaReconnectPrompt;
