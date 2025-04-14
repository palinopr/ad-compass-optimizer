
import React from 'react';

interface InconsistencyWarningProps {
  campaignCount: number;
}

const InconsistencyWarning: React.FC<InconsistencyWarningProps> = ({ campaignCount }) => {
  return (
    <div className="text-xs bg-amber-50 p-2 border border-amber-200 rounded mt-1">
      <p className="font-medium">UI/Data Inconsistency Detected</p>
      <p>Your data is loading correctly (fetched {campaignCount} campaigns), but is not displaying in the UI due to:</p>
      <ul className="list-disc pl-4 mt-1 space-y-1">
        <li>UI rendering state issues</li>
        <li>React component lifecycle problems</li>
        <li>Cached state preventing updates</li>
      </ul>
    </div>
  );
};

export default InconsistencyWarning;
