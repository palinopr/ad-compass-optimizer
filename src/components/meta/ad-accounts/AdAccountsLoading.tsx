
import React from 'react';
import { Loader2 } from 'lucide-react';

const AdAccountsLoading: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-4">
      <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
    </div>
  );
};

export default AdAccountsLoading;
