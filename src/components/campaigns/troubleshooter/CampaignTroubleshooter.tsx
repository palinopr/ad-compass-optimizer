
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import DiagnosticButton from '@/components/campaigns/DiagnosticButton';
import { runLiveCampaignDiagnostic } from '@/utils/meta-diagnostics/liveCampaignDiagnostic';

const CampaignTroubleshooter = () => {
  const [debugResult, setDebugResult] = useState<string[]>([]);

  return (
    <div className="border-t border-gray-200 pt-6 mt-8">
      <h3 className="text-sm font-medium text-center mb-2">Campaign Connection Troubleshooter</h3>
      <div className="flex flex-col gap-2">
        <DiagnosticButton />
        
        <p className="text-sm text-muted-foreground mb-2 text-center">
          🛠 Need help? Click "Run Live Campaign Debugger" to verify token and ad account status.
        </p>
        
        <div className="flex gap-2 justify-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => runLiveCampaignDiagnostic(setDebugResult)}
          >
            Run Live Campaign Debugger
          </Button>
          {(localStorage.getItem('USE_MOCK_META_API') === 'true' || 
            localStorage.getItem('mockMeta') === 'true') && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                localStorage.removeItem('USE_MOCK_META_API');
                localStorage.removeItem('mockMeta');
                toast({
                  title: '🧹 Mock Mode Disabled',
                  description: 'Meta API mock mode turned off. Refresh to reload campaigns.',
                });
                window.location.reload();
              }}
            >
              Disable Meta API Mock Mode
            </Button>
          )}
        </div>
        
        {debugResult.length > 0 && (
          <div className="mt-4 bg-muted p-3 rounded-md text-sm font-mono space-y-1">
            {debugResult.map((line, i) => {
              let color = 'text-muted-foreground';
              if (line.includes('❌')) color = 'text-red-500';
              else if (line.includes('⚠️')) color = 'text-yellow-600';
              else if (line.includes('✅')) color = 'text-green-600';
              return (
                <div key={i} className={color}>
                  {line}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignTroubleshooter;
