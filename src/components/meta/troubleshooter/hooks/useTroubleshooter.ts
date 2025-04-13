
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { runComprehensiveDiagnostic } from '@/utils/metaApiTest';
import { metaAuthService } from '@/services/MetaAuthService';

export const useTroubleshooter = (errorDetails?: any, onRetry?: () => void) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('account');
  const [runningDiagnostic, setRunningDiagnostic] = useState(false);
  const [diagnosticResults, setDiagnosticResults] = useState<any | null>(null);
  
  // Check for specific error types
  const isPermissionError = errorDetails?.error?.message?.toLowerCase().includes('permission') || 
                           errorDetails?.error?.code === 200 ||
                           errorDetails?.error?.code === 10;
  
  const isAccountError = errorDetails?.error?.message?.toLowerCase().includes('account') ||
                        !localStorage.getItem('selected_ad_account');
                        
  // Run diagnostic on mount to provide immediate feedback
  useEffect(() => {
    runDiagnostic();
    
    // Always default to account tab when the component mounts
    if (isAccountError) {
      setActiveTab('account');
    }
  }, []);
  
  const handleRefreshSession = () => {
    metaAuthService.logout();
    localStorage.setItem('show_meta_connection', 'true');
    toast({
      title: "Session Reset",
      description: "Your Facebook session will be refreshed. Please log in again."
    });
    setTimeout(() => window.location.reload(), 1000);
  };
  
  const runDiagnostic = async () => {
    setRunningDiagnostic(true);
    try {
      const results = await runComprehensiveDiagnostic();
      console.log("Diagnostic results:", results);
      setDiagnosticResults(results);
    } catch (error) {
      console.error("Error running diagnostics:", error);
      toast({
        title: "Diagnostic Error",
        description: "Failed to run connection diagnostics",
        variant: "destructive"
      });
    } finally {
      setRunningDiagnostic(false);
    }
  };
  
  const getPermissionStatus = () => {
    if (!diagnosticResults) return 'unknown';
    
    const token = diagnosticResults.token;
    if (!token.hasToken) return 'missing';
    if (!token.hasAdsRead && !token.hasAdsManagement) return 'insufficient';
    return 'ok';
  };
  
  const getApiConnectionStatus = () => {
    if (!diagnosticResults) return 'unknown';
    return diagnosticResults.api.success ? 'ok' : 'failed';
  };

  return {
    activeTab,
    setActiveTab,
    runningDiagnostic,
    diagnosticResults,
    isPermissionError,
    isAccountError,
    handleRefreshSession,
    runDiagnostic,
    getPermissionStatus,
    getApiConnectionStatus,
    onRetry,
  };
};
