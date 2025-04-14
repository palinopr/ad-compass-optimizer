
import React from 'react';
import { Check, X } from 'lucide-react';

interface StatusRowProps {
  isValid: boolean;
  label: string;
  value: string;
}

const StatusRow = ({ isValid, label, value }: StatusRowProps) => {
  return (
    <div className="flex items-center gap-2">
      {isValid ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        <X className="h-4 w-4 text-red-500" />
      )}
      <span className={isValid ? 'text-green-600' : 'text-red-600'}>
        {label}: {value}
      </span>
    </div>
  );
};

export default StatusRow;
