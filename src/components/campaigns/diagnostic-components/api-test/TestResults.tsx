
import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import type { ApiTestResult } from '@/utils/meta-diagnostics/apiTestUtils';

interface TestResultsProps {
  result: ApiTestResult | null;
}

const TestResults: React.FC<TestResultsProps> = ({ result }) => {
  if (!result) return null;

  return (
    <div className={`mt-4 p-4 rounded-md ${
      result.success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
    }`}>
      <div className="flex items-center gap-2 mb-2">
        {result.success ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : (
          <XCircle className="h-5 w-5 text-red-600" />
        )}
        <h3 className={`font-medium ${
          result.success ? 'text-green-800' : 'text-red-800'
        }`}>
          {result.success ? 'API Test Passed' : 'API Test Failed'}
        </h3>
      </div>
      
      <p className={`text-sm ${
        result.success ? 'text-green-700' : 'text-red-700'
      }`}>
        {result.message}
      </p>
      
      {result.details && result.success && (
        <div className="mt-4 text-xs text-green-800 bg-white p-2 rounded border border-green-100">
          <div className="font-medium mb-1">Test Details:</div>
          <ul className="list-disc pl-4 space-y-1">
            <li>Account status: {result.details.accountStatus}</li>
            <li>Account ID: {result.details.accountId}</li>
            <li>Campaigns API status: {result.details.campaignsApiStatus}</li>
            <li>Has campaigns: {result.details.hasCampaigns ? 'Yes' : 'No'}</li>
            {result.details.hasCampaigns && result.details.campaignsData.data && (
              <li>First campaign name: {result.details.campaignsData.data[0]?.name}</li>
            )}
          </ul>
        </div>
      )}
      
      <div className="text-xs mt-2 text-gray-500">
        Test run at: {new Date(result.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

export default TestResults;
