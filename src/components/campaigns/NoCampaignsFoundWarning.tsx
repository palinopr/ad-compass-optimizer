
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface NoCampaignsFoundWarningProps {
  hasValidConnection: boolean;
}

const NoCampaignsFoundWarning: React.FC<NoCampaignsFoundWarningProps> = ({ 
  hasValidConnection 
}) => {
  if (!hasValidConnection) return null;

  return (
    <Alert variant="warning" className="mt-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        <p className="text-yellow-600 font-medium">
          No campaigns were found for the selected ad account. If you expected to see data, please confirm:
        </p>
        <ul className="list-disc ml-6 mt-2 text-sm text-gray-700">
          <li>The ad account has active or archived campaigns</li>
          <li>You have access to manage campaigns for this account</li>
          <li>The correct business is connected in Meta Business Manager</li>
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default NoCampaignsFoundWarning;
