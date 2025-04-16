
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface InconsistencyWarningProps {
  campaignCount: number;
}

const InconsistencyWarning: React.FC<InconsistencyWarningProps> = ({ campaignCount }) => {
  return (
    <div className="text-xs bg-amber-50 p-2 border border-amber-200 rounded mt-1">
      <p className="font-medium">UI/Data Inconsistency Detected</p>
      <p>Your data is loading correctly (fetched {campaignCount} campaigns), but is not displaying in the UI due to:</p>
      <ul className="list-disc pl-5 mt-1">
        <li>Missing Meta API permissions (code 100, subcode 33)</li>
        <li>Invalid campaign object structure</li>
        <li>React rendering error</li>
      </ul>
      <div className="flex items-center text-amber-700 mt-1">
        <AlertTriangle className="h-3 w-3 mr-1" />
        <span>Try reconnecting your Meta account</span>
      </div>
    </div>
  );
};

export default InconsistencyWarning;
