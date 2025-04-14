
import { toast } from '@/hooks/use-toast';

/**
 * Utility function to run diagnostic checks on campaign setup
 */
export const runLiveCampaignDiagnostic = (onResult?: (lines: string[]) => void) => {
  const results: string[] = [];
  results.push("=== 🎯 LIVE CAMPAIGN DIAGNOSTIC START ===");
  
  // Only run checks in browser environment
  if (typeof window === 'undefined') {
    console.warn('⚠️ Cannot run diagnostics outside browser environment');
    return;
  }

  // Check Meta token
  const token = localStorage.getItem('meta_access_token');
  if (token) {
    results.push('✅ Meta Token Exists');
    results.push(`Token Length: ${token.length} characters`);
  } else {
    results.push('❌ Meta Token Missing');
  }

  // Check Ad Account
  const adAccount = localStorage.getItem('selected_ad_account');
  if (adAccount) {
    results.push(`✅ Ad Account Selected: ${adAccount}`);
  } else {
    results.push('⚠️ No Ad Account Selected');
  }

  // Check Mock Mode Status
  const isMockMetaMode = localStorage.getItem('USE_MOCK_META_API') === 'true';
  const isMockMode = localStorage.getItem('USE_MOCK_MODE') === 'true';
  
  if (isMockMetaMode || isMockMode) {
    results.push(`⚠️ Mock Mode Active: Meta API: ${isMockMetaMode}, General: ${isMockMode}`);
  } else {
    results.push('✅ Production Mode Active (No Mock)');
  }

  results.push("=== ✅ LIVE CAMPAIGN DIAGNOSTIC END ===");

  // Log to console
  console.log(results.join('\n'));

  // Send results to callback if provided
  if (onResult) onResult(results);

  // Add toast notification
  toast({
    title: '✅ Diagnostic Complete',
    description: 'Check results below or in browser console.',
  });
};

