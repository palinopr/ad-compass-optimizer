
import { MetaCampaignService } from '@/services/api/MetaCampaignService';
import { toast } from '@/hooks/use-toast';

export const runFinalDiagnosticCheck = async () => {
  console.log('\n=== 🔍 [FINAL CHECK] Campaign Diagnostic ===\n');
  
  // Check token and auth status
  const token = localStorage.getItem('meta_access_token');
  const selectedAccount = localStorage.getItem('selected_ad_account');
  const isMockMode = localStorage.getItem('USE_MOCK_MODE') === 'true';
  
  console.log(`[FINAL CHECK] Auth Token: ${token ? '✅ Present' : '❌ Missing'}`);
  console.log(`[FINAL CHECK] Token Length: ${token?.length || 0} chars`);
  console.log(`[FINAL CHECK] Ad Account: ${selectedAccount || 'Not Selected'}`);
  console.log(`[FINAL CHECK] Mock Mode: ${isMockMode ? '⚠️ Active' : '✅ Disabled'}`);
  
  if (!token || !selectedAccount) {
    console.error('[FINAL CHECK] ❌ Missing required credentials');
    return {
      success: false,
      error: 'Missing credentials'
    };
  }

  try {
    // Attempt to fetch campaigns
    const startTime = performance.now();
    const result = await MetaCampaignService.fetchCampaigns(token, selectedAccount);
    const endTime = performance.now();
    
    console.log('\n[FINAL CHECK] API Response:');
    console.log(`Source: ${isMockMode ? 'Mock API' : 'Live Meta API'}`);
    console.log(`Status: Success`);
    console.log(`Campaigns Found: ${result.length}`);
    console.log(`Response Time: ${Math.round(endTime - startTime)}ms`);
    
    // Log success state
    toast({
      title: "✅ Diagnostic Complete",
      description: `Found ${result.length} campaigns in ${Math.round(endTime - startTime)}ms`,
    });

    return {
      success: true,
      campaignCount: result.length,
      responseTime: Math.round(endTime - startTime)
    };
  } catch (error: any) {
    console.error('\n[FINAL CHECK] ❌ Error:', error);
    console.error('Error Details:', error?.response ? {
      status: error.response.status,
      statusText: error.response.statusText,
      message: error.message
    } : error);
    
    toast({
      title: "❌ Diagnostic Failed",
      description: error?.message || "Failed to fetch campaigns",
      variant: "destructive"
    });

    return {
      success: false,
      error: error?.message || 'Unknown error',
      details: error
    };
  }
};

