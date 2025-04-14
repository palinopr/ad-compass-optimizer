
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface NoCampaignsFoundWarningProps {
  hasValidConnection: boolean;
}

const NoCampaignsFoundWarning: React.FC<NoCampaignsFoundWarningProps> = ({ 
  hasValidConnection 
}) => {
  if (!hasValidConnection) return null;

  return (
    <Alert 
      variant="default" 
      className={cn(
        "mt-4 border-yellow-200 bg-yellow-50 text-yellow-600",
        "dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      )}
    >
      <AlertTriangle className="h-4 w-4 text-yellow-500 dark:text-yellow-300" />
      <AlertDescription>
        <p className="font-medium">
          No campaigns were found for the selected ad account. If you expected to see data, please confirm:
        </p>
        <ul className="list-disc ml-6 mt-2 text-sm text-gray-700 dark:text-gray-300">
          <li>The ad account has active or archived campaigns</li>
          <li>You have access to manage campaigns for this account</li>
          <li>The correct business is connected in Meta Business Manager</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default NoCampaignsFoundWarning;
