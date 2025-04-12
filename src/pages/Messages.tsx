
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMessagesPageState } from '@/hooks/useMessagesPageState';
import { 
  LoadingState,
  NotAuthenticatedState,
  NoAdAccountState,
  ReadyState 
} from '@/components/messages/MessagesStateView';
import ConnectionStatusPanel from '@/components/messages/ConnectionStatusPanel';

const Messages = () => {
  const { 
    componentState, 
    adAccounts, 
    isAuthenticated,
    handleConnectClick,
    handleSelectAdAccount,
    checkAuthAndState,
    handleConnectWithBrowser
  } = useMessagesPageState();
  
  const { toast } = useToast();

  // Handle retry connection
  const handleRetryConnection = () => {
    toast({
      title: "Retrying connection",
      description: "Checking authentication status..."
    });
    
    checkAuthAndState();
  };

  // Render appropriate state view based on component state
  const renderContent = () => {
    switch (componentState) {
      case 'loading':
        return <LoadingState />;
        
      case 'not_authenticated':
        return <NotAuthenticatedState onConnect={handleConnectClick} />;
        
      case 'no_ad_account':
        return <NoAdAccountState onSelectAccount={handleSelectAdAccount} />;
        
      case 'ready':
        return <ReadyState />;
        
      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MessageSquare className="h-6 w-6" />
            Messages
          </h1>
          <p className="text-muted-foreground">View and manage your Meta ad messages and conversations</p>
        </div>
        
        {renderContent()}
        
        <Card>
          <CardHeader>
            <CardTitle>Messages & Conversations</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This feature is currently in development. Once implemented, you'll be able to view and respond
              to messages related to your Meta advertising campaigns.
            </p>
            
            <ConnectionStatusPanel 
              isAuthenticated={isAuthenticated}
              adAccounts={adAccounts}
              onRetryConnection={handleRetryConnection}
              onConnectWithBrowser={handleConnectWithBrowser}
            />
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Messages;
