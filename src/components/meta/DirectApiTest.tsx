
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { META_API_CONFIG } from '@/config/socialAuth';

const DirectApiTest: React.FC = () => {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const testApi = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      // Clean the token
      const cleanedToken = token.replace(/\s+/g, '').trim();
      
      // Make a simple API call
      const response = await fetch(
        `https://graph.facebook.com/${META_API_CONFIG.apiVersion}/me?access_token=${cleanedToken}`
      );
      
      const responseText = await response.text();
      console.log('Raw API response:', responseText);
      
      try {
        const data = JSON.parse(responseText);
        setResult(data);
      } catch (parseError) {
        setResult({ error: 'Failed to parse response as JSON', raw: responseText });
      }
    } catch (error) {
      setResult({ error: String(error) });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Direct API Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label htmlFor="direct-token" className="text-sm font-medium block mb-1">
              Meta Access Token
            </label>
            <Input
              id="direct-token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste your token here"
            />
          </div>
          
          <Button 
            onClick={testApi} 
            disabled={isLoading || !token.trim()}
          >
            {isLoading ? 'Testing...' : 'Test API Directly'}
          </Button>
          
          {result && (
            <div className="mt-4 p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-xs overflow-auto p-2 bg-gray-100 rounded">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectApiTest;
