
import React from 'react';
import { Info } from 'lucide-react';

interface FacebookNoticeProps {
  children: React.ReactNode;
}

const FacebookNotice: React.FC<FacebookNoticeProps> = ({ children }) => {
  return (
    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md w-full">
      <div className="flex items-start space-x-2 text-xs text-blue-700">
        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <span>{children}</span>
      </div>
    </div>
  );
};

export default FacebookNotice;
