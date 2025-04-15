
import React from 'react';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Bug, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { useCampaignDiagnostics } from '@/hooks/campaigns/useCampaignDiagnostics';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export const CampaignsDiagnosticPanel = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const diagnostics = useCampaignDiagnostics();

  return (
    <Card className="mt-4 p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-yellow-500" />
            <h3 className="font-medium">Campaign Diagnostics</h3>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="mt-4 space-y-4">
          {/* Token Information */}
          <section>
            <h4 className="font-medium mb-2">Token Status</h4>
            <Alert variant={diagnostics.tokenInfo.exists ? "default" : "destructive"}>
              <AlertTitle>
                Token {diagnostics.tokenInfo.exists ? "Present" : "Missing"}
              </AlertTitle>
              <AlertDescription className="mt-2">
                <div>Type: {diagnostics.tokenInfo.type}</div>
                {diagnostics.tokenInfo.value && (
                  <div className="text-xs mt-1 font-mono">
                    Value: {diagnostics.tokenInfo.value}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          </section>

          {/* Ad Accounts Information */}
          <section>
            <h4 className="font-medium mb-2">Ad Accounts</h4>
            <Alert>
              <AlertTitle>
                Found {diagnostics.adAccounts.count} account(s)
              </AlertTitle>
              <AlertDescription className="mt-2">
                <div>Selected Account: {diagnostics.adAccounts.selectedId || "None"}</div>
                {diagnostics.adAccounts.raw.length > 0 && (
                  <pre className="text-xs mt-2 bg-gray-50 p-2 rounded overflow-auto max-h-40">
                    {JSON.stringify(diagnostics.adAccounts.raw, null, 2)}
                  </pre>
                )}
              </AlertDescription>
            </Alert>
          </section>

          {/* API Errors */}
          {diagnostics.apiResponses.lastError && (
            <section>
              <h4 className="font-medium mb-2 text-red-500">Last Error</h4>
              <Alert variant="destructive">
                <AlertDescription className="font-mono text-xs">
                  {diagnostics.apiResponses.lastError}
                </AlertDescription>
              </Alert>
            </section>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};
