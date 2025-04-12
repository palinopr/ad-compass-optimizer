
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

interface AdAccountStatusProps {
  adAccounts: any[];
}

const AdAccountStatus: React.FC<AdAccountStatusProps> = ({ adAccounts }) => {
  return (
    <>
      <div>Ad Account:</div>
      <div className="flex items-center">
        {adAccounts.length > 0 ? (
          <>
            <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600">Selected ({adAccounts.length})</span>
          </>
        ) : (
          <>
            <XCircle className="h-4 w-4 text-red-600 mr-1" />
            <span className="text-red-600">Not Selected</span>
          </>
        )}
      </div>
    </>
  );
};

export default AdAccountStatus;
