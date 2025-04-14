
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileX } from 'lucide-react';

interface EmptyStateMessageProps {
  adAccountId: string | null;
}

const EmptyStateMessage: React.FC<EmptyStateMessageProps> = ({ adAccountId }) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="bg-amber-50 rounded-full p-3 mb-4">
          <FileX className="h-6 w-6 text-amber-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Campaigns Found</h3>
        <p className="text-gray-500">
          No active campaigns found for ad account{' '}
          <span className="font-mono text-sm bg-gray-100 px-1 rounded">
            {adAccountId || 'Not Selected'}
          </span>
        </p>
      </div>
    </Card>
  );
};

export default EmptyStateMessage;
