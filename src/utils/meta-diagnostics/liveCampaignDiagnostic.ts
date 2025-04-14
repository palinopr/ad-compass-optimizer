
import { toast } from '@/hooks/use-toast';

/**
 * Utility function to run diagnostic checks on campaign setup
 */
export const runLiveCampaignDiagnostic = () => {
  console.log('=== LIVE CAMPAIGN DIAGNOSTIC START ===');
  
  // Only run checks in browser environment
  if (typeof window === 'undefined') {
    console.warn('⚠️ Cannot run diagnostics outside browser environment');
    return;
  }

  // Check Meta token
  const metaToken = localStorage.getItem('meta_access_token');
  if (metaToken) {
    console.log('✅ Meta Token Exists');
    console.log(`Token Length: ${metaToken.length} characters`);
  } else {
    console.error('❌ Meta Token Missing');
  }

  // Check Ad Account
  const adAccount = localStorage.getItem('selected_ad_account');
  if (adAccount) {
    console.log(`✅ Ad Account Selected: ${adAccount}`);
  } else {
    console.warn('⚠️ No Ad Account Selected');
  }

  // Check Mock Mode Status
  const isMockMetaMode = localStorage.getItem('USE_MOCK_META_API') === 'true';
  const isMockMode = localStorage.getItem('USE_MOCK_MODE') === 'true';
  
  if (isMockMetaMode || isMockMode) {
    console.warn('⚠️ Mock Mode Active:', {
      metaApiMock: isMockMetaMode,
      generalMock: isMockMode
    });
  } else {
    console.log('✅ Production Mode Active (No Mock)');
  }

  console.log('=== ✅ LIVE CAMPAIGN DIAGNOSTIC END ===');

  // Add toast notification
  toast({
    title: '✅ Diagnostic Complete',
    description: 'Check the browser console for results.',
  });
};
