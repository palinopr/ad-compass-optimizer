
import React from 'react';

interface ConnectionFlowErrorProps {
  errorMessage: string | null;
}

const ConnectionFlowError: React.FC<ConnectionFlowErrorProps> = ({ errorMessage }) => {
  if (!errorMessage) return null;
  
  return (
    <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
      {errorMessage}
    </div>
  );
};

export default ConnectionFlowError;
