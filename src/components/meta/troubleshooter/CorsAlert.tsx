
import React from 'react';
import { Database } from 'lucide-react';

interface CorsAlertProps {
  diagnosticResults: any;
  tokenSource: string | null;
}

const CorsAlert: React.FC<CorsAlertProps> = ({ diagnosticResults, tokenSource }) => {
  if (!diagnosticResults || !diagnosticResults.cors || !diagnosticResults.cors.hasCorsIssues || tokenSource !== 'facebook') {
    return null;
  }
  
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm">
      <div className="flex">
        <Database className="h-4 w-4 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
        <p>
          CORS issues were detected in diagnostics, but you're using Facebook authentication 
          which should bypass these issues. Your campaign loading problem is likely related 
          to ad account selection or permissions rather than CORS.
        </p>
      </div>
    </div>
  );
};

export default CorsAlert;
