
import React from 'react';
import { BusinessManager } from '@/hooks/useBusinessManagers';

interface BusinessManagerDetailsProps {
  businessManager: BusinessManager;
}

const BusinessManagerDetails: React.FC<BusinessManagerDetailsProps> = ({ businessManager }) => {
  return (
    <div className="bg-gray-50 p-3 rounded-md border text-sm">
      <p className="font-medium">Selected Business Manager Details:</p>
      <div className="mt-1">
        <p><span className="text-gray-600">Name:</span> {businessManager.name}</p>
        <p><span className="text-gray-600">ID:</span> {businessManager.id}</p>
        {businessManager.verification_status && (
          <p><span className="text-gray-600">Status:</span> {businessManager.verification_status}</p>
        )}
      </div>
    </div>
  );
};

export default BusinessManagerDetails;
