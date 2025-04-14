import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Database, CheckCircle, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { metaAuthService } from '@/services/MetaAuthService';

interface ApiTestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

const ApiTestPanel: React.FC = () => {
  if (process.env.NODE_ENV === 'production') return null;
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<ApiTestResult | null>(null);
  
  const runApiTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      const token = metaAuthService.getAccessToken();
      
      if (!token) {
        setTestResult({
          success: false,
          message: "No access token available. Please connect your Meta account.",
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      const adAccountId = localStorage.getItem('selected_ad_account');
      
      if (!adAccountId) {
        setTestResult({
          success: false,
          message: "No ad account selected. Please select an ad account.",
          timestamp: new Date().toISOString()
        });
        return;
      }
      
      const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
      
      const response = await fetch(
        `https://graph.facebook.com/v17.0/${formattedAccountId}?fields=name,id,account_status&access_token=${token}`,
        {
          headers: {
            'User-Agent': 'meta-marketing-dashboard/1.0',
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      const campaignsResponse = await fetch(
        `https://graph.facebook.com/v17.0/${formattedAccountId}/campaigns?fields=name,id&limit=1&access_token=${token}`,
        {
          headers: {
            'User-Agent': 'meta-marketing-dashboard/1.0',
            'Accept': 'application/json'
          }
        }
      );
      
      const campaignsData = await campaignsResponse.json();
      
      setTestResult({
        success: true,
        message: `Successfully connected to ad account: ${data.name}`,
        details: {
          accountStatus: data.account_status,
          accountId: data.id,
          campaignsApiStatus: campaignsResponse.status,
          hasCampaigns: campaignsData.data && campaignsData.data.length > 0,
          campaignsData: campaignsData
        },
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "API Test Successful",
        description: `Successfully connected to ad account: ${data.name}`,
      });
    } catch (error) {
      console.error('API test error:', error);
      
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "API Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive"
      });
    } finally {
      setIsTesting(false);
    }
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
            onClick={runApiTest}
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
        
        {testResult && (
          <div className={`mt-4 p-4 rounded-md ${
            testResult.success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {testResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              <h3 className={`font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.success ? 'API Test Passed' : 'API Test Failed'}
              </h3>
            </div>
            
            <p className={`text-sm ${
              testResult.success ? 'text-green-700' : 'text-red-700'
            }`}>
              {testResult.message}
            </p>
            
            {testResult.details && testResult.success && (
              <div className="mt-4 text-xs text-green-800 bg-white p-2 rounded border border-green-100">
                <div className="font-medium mb-1">Test Details:</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Account status: {testResult.details.accountStatus}</li>
                  <li>Account ID: {testResult.details.accountId}</li>
                  <li>Campaigns API status: {testResult.details.campaignsApiStatus}</li>
                  <li>Has campaigns: {testResult.details.hasCampaigns ? 'Yes' : 'No'}</li>
                  {testResult.details.hasCampaigns && testResult.details.campaignsData.data && (
                    <li>First campaign name: {testResult.details.campaignsData.data[0]?.name}</li>
                  )}
                </ul>
              </div>
            )}
            
            <div className="text-xs mt-2 text-gray-500">
              Test run at: {new Date(testResult.timestamp).toLocaleString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ApiTestPanel;
