
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DiagnosticResultsProps {
  diagnosticResults: any;
  getPermissionStatus: () => 'ok' | 'missing' | 'insufficient' | 'unknown';
  getApiConnectionStatus: () => 'ok' | 'failed' | 'unknown';
}

const DiagnosticResults: React.FC<DiagnosticResultsProps> = ({
  diagnosticResults,
  getPermissionStatus,
  getApiConnectionStatus
}) => {
  if (!diagnosticResults) return null;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Auth Status */}
        <div className={`border rounded p-3 ${diagnosticResults.token.hasToken ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">Authentication</p>
            {diagnosticResults.token.hasToken ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
          </div>
          <p className="text-sm mt-1 capitalize">
            {diagnosticResults.token.hasToken ? `Using ${diagnosticResults.token.source || 'facebook'} auth` : 'Not authenticated'}
          </p>
        </div>
        
        {/* Permissions Status */}
        <div className={`border rounded p-3 ${getPermissionStatus() === 'ok' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">Permissions</p>
            {getPermissionStatus() === 'ok' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className="text-sm mt-1">
            {getPermissionStatus() === 'ok' ? 'Required permissions present' : 'Missing required permissions'}
          </p>
        </div>
        
        {/* API Connection */}
        <div className={`border rounded p-3 ${getApiConnectionStatus() === 'ok' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium">API Connection</p>
            {getApiConnectionStatus() === 'ok' ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <p className="text-sm mt-1">
            {getApiConnectionStatus() === 'ok' ? 'API connection successful' : 'API connection failed'}
          </p>
        </div>
      </div>
      
      {/* Summary of issues */}
      {diagnosticResults.summary && diagnosticResults.summary.issues && diagnosticResults.summary.issues.length > 0 && (
        <Alert className={diagnosticResults.summary.overallStatus === 'high' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}>
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription>
            <p className="font-medium">Issues Detected:</p>
            <ul className="list-disc pl-5 text-sm mt-1">
              {diagnosticResults.summary.issues.map((issue: string, i: number) => (
                <li key={i}>{issue}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Recommendations */}
      {diagnosticResults.summary && diagnosticResults.summary.recommendations && diagnosticResults.summary.recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-blue-800">
          <p className="font-medium mb-1">Recommended Actions:</p>
          <ul className="list-decimal pl-5 text-sm">
            {diagnosticResults.summary.recommendations.map((rec: string, i: number) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DiagnosticResults;
