
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Briefcase, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdAccountDropdown from './ad-accounts/AdAccountDropdown';
import { useAdAccounts } from './ad-accounts/hooks/useAdAccounts';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Error boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode, fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode, fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error("Error in AdAccountSelector:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ Something went wrong with the ad account selector. Please refresh the page.
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

const AdAccountSelector = () => {
  const [renderError, setRenderError] = useState<string | null>(null);

  // Try to use the hook, but catch any errors
  let accountsHookResult;
  try {
    accountsHookResult = useAdAccounts();
  } catch (err) {
    console.error('[META] Error in useAdAccounts hook:', err);
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base">
            <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
            Ad Account Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Failed to load ad account selector. Please refresh the page.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Destructure safely
  const { 
    adAccounts = [], 
    selectedAccount = '', 
    isLoading = false, 
    error = null, 
    fetchAdAccounts = () => Promise.resolve(), 
    handleAccountChange = () => {}
  } = accountsHookResult || {};

  const handleRefresh = () => {
    try {
      toast({
        title: "Refreshing Ad Accounts",
        description: "Fetching your latest Meta ad accounts..."
      });
      fetchAdAccounts();
    } catch (err) {
      console.error('[META] Error refreshing accounts:', err);
      setRenderError('Failed to refresh accounts. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center text-base">
          <Briefcase className="w-4 h-4 mr-2 text-blue-600" />
          Ad Account Selection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderError && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{renderError}</AlertDescription>
          </Alert>
        )}
        
        {error && (
          <div className="space-y-2 mb-3">
            <p className="text-sm text-red-500">Error fetching ad accounts</p>
            <div className="text-xs bg-red-50 border border-red-200 rounded p-2">
              <code className="text-red-600 whitespace-pre-wrap break-all">
                {error}
              </code>
            </div>
          </div>
        )}
        
        {Array.isArray(adAccounts) && adAccounts.length === 0 && !isLoading && !error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ No ad accounts returned. Please check Meta permissions and token scopes.
            </AlertDescription>
          </Alert>
        )}
        
        <ErrorBoundary>
          <AdAccountDropdown
            adAccounts={adAccounts || []}
            selectedAccount={selectedAccount || ''}
            isLoading={isLoading}
            onChange={handleAccountChange}
          />
        </ErrorBoundary>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Accounts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdAccountSelector;
