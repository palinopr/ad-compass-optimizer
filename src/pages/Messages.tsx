
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useMessagesPageState } from '@/hooks/useMessagesPageState';
import { useToast } from '@/hooks/use-toast';
import { 
  LoadingState,
  NotAuthenticatedState,
  NoAdAccountState,
  ReadyState 
} from '@/components/messages/MessagesStateView';
import MessagesHeader from '@/components/messages/MessagesHeader';
import MessagesCard from '@/components/messages/MessagesCard';

const Messages = () => {
  const { 
    componentState, 
    adAccounts, 
    isAuthenticated,
    handleConnectClick,
    handleSelectAdAccount,
    checkAuthAndState,
    handleConnectWithBrowser,
    handleRetryConnection
  } = useMessagesPageState();
  
  const { toast } = useToast();

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
        <MessagesHeader />
        
        {renderContent()}
        
        <MessagesCard 
          isAuthenticated={isAuthenticated}
          adAccounts={adAccounts}
          onRetryConnection={handleRetryConnection}
          onConnectWithBrowser={handleConnectWithBrowser}
        />
      </div>
    </AppLayout>
  );
};

export default Messages;
