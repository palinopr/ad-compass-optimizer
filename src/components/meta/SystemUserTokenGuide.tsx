
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { META_API_CONFIG } from '@/config/socialAuth';

const SystemUserTokenGuide: React.FC = () => {
  return (
    <Alert className="bg-blue-50 border-blue-200 my-4">
      <AlertTitle className="text-blue-800">
        The recommended solution: System User Token
      </AlertTitle>
      <AlertDescription className="text-blue-700">
        <p className="mb-2">How to get a System User Token:</p>
        <ol className="list-decimal pl-5 space-y-1">
          {META_API_CONFIG.systemUserGuide.steps.map((step, index) => (
            <li key={index}>{step}</li>
          ))}
        </ol>
      </AlertDescription>
    </Alert>
  );
};

export default SystemUserTokenGuide;
