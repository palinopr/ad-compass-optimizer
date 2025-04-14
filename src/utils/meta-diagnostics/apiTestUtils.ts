
import { metaAuthService } from '@/services/MetaAuthService';
import { toast } from '@/hooks/use-toast';

export interface ApiTestResult {
  success: boolean;
  message: string;
  details?: any;
  timestamp: string;
}

export async function runMetaApiTest(): Promise<ApiTestResult> {
  const token = metaAuthService.getAccessToken();
  
  if (!token) {
    return {
      success: false,
      message: "No access token available. Please connect your Meta account.",
      timestamp: new Date().toISOString()
    };
  }
  
  const adAccountId = localStorage.getItem('selected_ad_account');
  
  if (!adAccountId) {
    return {
      success: false,
      message: "No ad account selected. Please select an ad account.",
      timestamp: new Date().toISOString()
    };
  }
  
  const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  
  try {
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
    
    const result = {
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
    };
    
    toast({
      title: "API Test Successful",
      description: result.message,
    });
    
    return result;
  } catch (error) {
    console.error('API test error:', error);
    
    const result = {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
    
    toast({
      title: "API Test Failed",
      description: result.message,
      variant: "destructive"
    });
    
    return result;
  }
}
