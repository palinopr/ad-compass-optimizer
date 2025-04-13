
import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, Database } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';
import { ConnectionStatusCards } from '../ConnectionStatusCards';

interface ConnectionTabProps {
  diagnosticResults: any;
  runDiagnostic: () => void;
}

const ConnectionTab: React.FC<ConnectionTabProps> = ({
  diagnosticResults,
  runDiagnostic
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Meta API Connection</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={runDiagnostic} 
          className="flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          Run Check
        </Button>
      </div>
      
      {diagnosticResults ? (
        <div className="space-y-4">
          <ConnectionStatusCards diagnosticResults={diagnosticResults} />
          
          {/* Issues & Recommendations */}
          {diagnosticResults.summary && diagnosticResults.summary.issues && 
           diagnosticResults.summary.issues.length > 0 && (
            <Alert className="bg-amber-50 border-amber-200">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Issues Detected</AlertTitle>
              <AlertDescription>
                <ul className="list-disc pl-5 text-sm mt-1">
                  {diagnosticResults.summary.issues.map((issue: string, i: number) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
          
          {/* CORS Specific Alert */}
          {diagnosticResults.cors && diagnosticResults.cors.hasCorsIssues && metaAuthService.getTokenSource() === 'facebook' && (
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
          )}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          Run diagnostics to analyze connection issues
        </div>
      )}
    </div>
  );
};

export default ConnectionTab;
