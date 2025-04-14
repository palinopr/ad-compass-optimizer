
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Database } from 'lucide-react';
import { runMetaApiTest } from '@/utils/meta-diagnostics/apiTestUtils';
import type { ApiTestResult } from '@/utils/meta-diagnostics/apiTestUtils';
import TestResults from './api-test/TestResults';

const ApiTestPanel: React.FC = () => {
  if (process.env.NODE_ENV === 'production') return null;
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);
  
  const handleApiTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    const result = await runMetaApiTest();
    setTestResult(result);
    setIsTesting(false);
  };
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-500" />
          Meta API Test
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-gray-600">
          Test your connection to the Meta API to verify that your token and permissions are working correctly.
        </p>
        
        <div className="flex justify-end">
          <Button
            onClick={handleApiTest}
            disabled={isTesting}
            className="flex items-center gap-2"
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Run API Test
              </>
            )}
          </Button>
        </div>
        
        <TestResults result={testResult} />
      </CardContent>
    </Card>
  );
};

export default ApiTestPanel;
