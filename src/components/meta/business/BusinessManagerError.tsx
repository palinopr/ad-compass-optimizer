
import React from 'react';

interface BusinessManagerErrorProps {
  error: string;
}

const BusinessManagerError: React.FC<BusinessManagerErrorProps> = ({ error }) => {
  return (
    <div className="text-red-500 py-4">
      <p className="font-medium">{error}</p>
      <p className="text-sm mt-2">Please try reconnecting your Facebook account.</p>
    </div>
  );
};

export default BusinessManagerError;
