
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import DirectApiTest from '@/components/meta/DirectApiTest';

const DiagnosticsTab: React.FC = () => {
  return (
    <>
      <DirectApiTest />
      
      <Card>
        <CardHeader>
          <CardTitle>API Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="font-medium">Common Issues</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>
                <strong>Invalid Token Format</strong>: Ensure your token doesn't contain any spaces or special characters.
              </li>
              <li>
                <strong>Expired Token</strong>: Meta tokens typically expire after 60 days. Check the token age in the diagnostics.
              </li>
              <li>
                <strong>Missing Permissions</strong>: Your token needs at least 'ads_management' and 'ads_read' permissions.
              </li>
              <li>
                <strong>CORS Issues</strong>: These occur when the API server doesn't allow requests from your domain.
              </li>
            </ul>
            
            <h3 className="font-medium mt-4">Recommendations</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>Generate a fresh System User Token with the correct permissions.</li>
              <li>Use the diagnostic tools to identify the exact issue.</li>
              <li>Check the browser console for any errors.</li>
              <li>Try the Direct API Test above to test the API connection.</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default DiagnosticsTab;
