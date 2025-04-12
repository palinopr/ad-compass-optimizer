
import React from 'react';
import { MessageSquare } from 'lucide-react';

const MessagesHeader: React.FC = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
        <MessageSquare className="h-6 w-6" />
        Messages
      </h1>
      <p className="text-muted-foreground">View and manage your Meta ad messages and conversations</p>
    </div>
  );
};

export default MessagesHeader;
