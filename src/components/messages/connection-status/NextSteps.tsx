
import React from 'react';
import { AlertCircle } from 'lucide-react';

const NextSteps: React.FC = () => {
  return (
    <div className="border-t pt-3 mt-2">
      <h4 className="text-sm font-medium mb-2">Next Steps</h4>
      <div className="space-y-2 text-xs">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5" />
          <span>
            Please select an ad account to view messages. Visit the <a href="/meta-integration?tab=accounts" className="text-blue-600 underline">Accounts tab</a>.
          </span>
        </div>
      </div>
    </div>
  );
};

export default NextSteps;
