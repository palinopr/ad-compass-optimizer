
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Info } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = "Checking authentication status..." }) => (
  <Alert className="bg-slate-50 border-slate-200">
    <Loader2 className="h-4 w-4 text-slate-600 animate-spin" />
    <AlertDescription className="text-slate-700">
      {message}
    </AlertDescription>
  </Alert>
);

interface NotAuthenticatedStateProps {
  onConnect: () => void;
}

export const NotAuthenticatedState: React.FC<NotAuthenticatedStateProps> = ({ onConnect }) => (
  <Alert className="bg-amber-50 border-amber-200">
    <AlertCircle className="h-5 w-5 text-amber-600" />
    <AlertDescription className="text-amber-700 flex items-center justify-between w-full">
      <span>Not authenticated with Meta. Please connect your account.</span>
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-amber-100 hover:bg-amber-200 ml-4"
        onClick={onConnect}
      >
        Connect Now
      </Button>
    </AlertDescription>
  </Alert>
);

interface NoAdAccountStateProps {
  onSelectAccount: () => void;
}

export const NoAdAccountState: React.FC<NoAdAccountStateProps> = ({ onSelectAccount }) => (
  <Alert className="bg-amber-50 border-amber-200">
    <AlertCircle className="h-5 w-5 text-amber-600" />
    <AlertDescription className="text-amber-700 flex items-center justify-between w-full">
      <span>Please select an ad account to view message data.</span>
      <Button 
        variant="outline" 
        size="sm" 
        className="bg-amber-100 hover:bg-amber-200 ml-4"
        onClick={onSelectAccount}
      >
        Select Account
      </Button>
    </AlertDescription>
  </Alert>
);

export const ReadyState: React.FC = () => (
  <Alert className="bg-blue-50 border-blue-200">
    <Info className="h-5 w-5 text-blue-600" />
    <AlertDescription className="text-blue-700">
      Messages feature is coming soon. This page will display your ad messages and conversations.
    </AlertDescription>
  </Alert>
);
