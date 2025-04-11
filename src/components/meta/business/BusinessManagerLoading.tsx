
import React from 'react';
import { Loader2 } from 'lucide-react';

const BusinessManagerLoading: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-2">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm text-gray-500">Loading Business Managers...</span>
    </div>
  );
};

export default BusinessManagerLoading;
