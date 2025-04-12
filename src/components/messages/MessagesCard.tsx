
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ConnectionStatusPanel from '@/components/messages/ConnectionStatusPanel';

interface MessagesCardProps {
  isAuthenticated: boolean;
  adAccounts: any[];
  onRetryConnection: () => void;
  onConnectWithBrowser: () => void;
}

const MessagesCard: React.FC<MessagesCardProps> = ({
  isAuthenticated,
  adAccounts,
  onRetryConnection,
  onConnectWithBrowser
}) => {
  return (
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
          onRetryConnection={onRetryConnection}
          onConnectWithBrowser={onConnectWithBrowser}
        />
      </CardContent>
    </Card>
  );
};

export default MessagesCard;
