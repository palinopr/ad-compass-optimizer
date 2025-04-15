
import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface TokenStatusSectionProps {
  exists: boolean;
  isValid: boolean;
}

const TokenStatusSection = ({ exists, isValid }: TokenStatusSectionProps) => {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between text-sm">
        <span>Token Status:</span>
        <span className={exists ? 'text-green-600' : 'text-red-600'}>
          {exists ? 'FOUND' : 'NOT FOUND'}
        </span>
      </div>
      {exists && !isValid && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Invalid token format detected</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default TokenStatusSection;
