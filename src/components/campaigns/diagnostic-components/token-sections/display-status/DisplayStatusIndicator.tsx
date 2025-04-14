
import React from 'react';

interface DisplayStatusIndicatorProps {
  hasUIDisplayIssue: boolean;
  hasDataInconsistency: boolean;
}

const DisplayStatusIndicator: React.FC<DisplayStatusIndicatorProps> = ({
  hasUIDisplayIssue,
  hasDataInconsistency
}) => {
  return (
    <p>
      Status: 
      {hasUIDisplayIssue ? (
        <span className="text-amber-600 ml-1">Data loaded but not displaying</span>
      ) : hasDataInconsistency ? (
        <span className="text-amber-600 ml-1">Data loaded but may not be displaying</span>
      ) : (
        <span className="text-green-600 ml-1">Should be visible</span>
      )}
    </p>
  );
};

export default DisplayStatusIndicator;
