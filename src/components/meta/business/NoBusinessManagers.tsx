
import React from 'react';

const NoBusinessManagers: React.FC = () => {
  return (
    <div className="py-4">
      <p className="text-amber-600 font-medium">No Business Managers found for your account.</p>
      <p className="text-sm text-gray-500 mt-2">
        You need access to a Business Manager to connect ad accounts.
        Please create a Business Manager in Meta Business Suite first.
      </p>
    </div>
  );
};

export default NoBusinessManagers;
