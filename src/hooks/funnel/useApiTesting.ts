
import { useState } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { toast } from '@/hooks/use-toast';

export const useApiTesting = (setRawApiResponse: (response: any) => void) => {
  const [isFetchingFunnel, setIsFetchingFunnel] = useState(false);
  const [funnelError, setFunnelError] = useState<string | null>(null);

  const getFormattedAdAccountId = () => {
    let selectedAdAccount = null;
    try {
      if (typeof localStorage !== 'undefined') {
        selectedAdAccount = localStorage.getItem('selected_ad_account');
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
    }
    
    if (!selectedAdAccount) return null;
    
    return selectedAdAccount.startsWith('act_') 
      ? selectedAdAccount
      : `act_${selectedAdAccount}`;
  };

  const testDirectApiCall = async () => {
    try {
      setIsFetchingFunnel(true);
      toast({
        title: "Testing Direct API Call",
        description: "Making a minimal test request to Meta API..."
      });

      const token = metaAuthService.getAccessToken();
      if (!token) {
        setFunnelError('Missing access token');
        setIsFetchingFunnel(false);
        return;
      }

      const adAccountId = getFormattedAdAccountId();
      if (!adAccountId) {
        setFunnelError('No ad account selected');
        setIsFetchingFunnel(false);
        return;
      }

      console.log('[FUNNEL DEBUG] Making test request for account:', adAccountId);
      const testUrl = `https://graph.facebook.com/v17.0/${adAccountId}?fields=name,account_status&access_token=${token}`;
      
      const response = await fetch(testUrl);
      const responseText = await response.clone().text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { parseError: true, text: responseText };
      }
      
      localStorage.setItem('api_test_response', JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        timestamp: new Date().toISOString(),
        url: testUrl.replace(token, 'REDACTED')
      }));
      
      setRawApiResponse({
        testResponse: {
          status: response.status,
          statusText: response.statusText,
          data
        }
      });
      
      if (!response.ok) {
        setFunnelError(`Test request failed: ${response.status} ${response.statusText}`);
        toast({
          title: "API Test Failed",
          description: `Status ${response.status}: ${data?.error?.message || response.statusText}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "API Test Successful",
          description: `Connected to account: ${data.name}`,
          variant: "default"
        });
      }
    } catch (err: any) {
      console.error('[FUNNEL DEBUG] Test API call failed:', err);
      setFunnelError(`Test API call failed: ${err.message}`);
      
      localStorage.setItem('api_test_error', JSON.stringify({
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      }));
    } finally {
      setIsFetchingFunnel(false);
    }
  };

  const verifyPermissions = async () => {
    try {
      const token = metaAuthService.getAccessToken();
      if (!token) {
        toast({
          title: "Missing Token",
          description: "No access token found",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Checking Permissions",
        description: "Verifying Meta API permissions..."
      });
      
      const response = await fetch(`https://graph.facebook.com/v17.0/me/permissions?access_token=${token}`);
      const data = await response.json();
      
      localStorage.setItem('permissions_check', JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
      
      setRawApiResponse({
        permissions: data
      });
      
      const requiredPermissions = ['ads_read', 'ads_management'];
      const missingPermissions = requiredPermissions.filter(perm => 
        !data.data?.some(p => p.permission === perm && p.status === 'granted')
      );
      
      if (missingPermissions.length > 0) {
        toast({
          title: "Missing Permissions",
          description: `Missing: ${missingPermissions.join(', ')}`,
          variant: "destructive",
          duration: 5000
        });
      } else {
        toast({
          title: "Permissions OK",
          description: "All required permissions are granted",
          variant: "default"
        });
      }
    } catch (err: any) {
      console.error('[FUNNEL DEBUG] Permission check failed:', err);
      toast({
        title: "Permission Check Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  return {
    isFetchingFunnel,
    funnelError,
    testDirectApiCall,
    verifyPermissions
  };
};
