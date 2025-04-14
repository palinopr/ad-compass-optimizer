
import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

const MockModePanel = () => {
  const isMockMetaMode = localStorage.getItem('USE_MOCK_META_API') === 'true';
  const isMockMode = localStorage.getItem('USE_MOCK_MODE') === 'true';

  if (!isMockMetaMode && !isMockMode) return null;

  const disableMockMode = () => {
    localStorage.removeItem('USE_MOCK_META_API');
    localStorage.removeItem('mockMeta');
    toast({
      title: '🧹 Mock Mode Disabled',
      description: 'Meta API mock mode turned off. Refresh to reload campaigns.',
    });
    window.location.reload();
  };

  return (
    <Card className="mt-4 p-4 border-yellow-200 bg-yellow-50">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-medium text-yellow-800 mb-2">Mock Mode Active</h3>
          <p className="text-sm text-yellow-700 mb-4">
            Using simulated data instead of real Meta API requests. 
            Meta API Mock: {isMockMetaMode ? 'Enabled' : 'Disabled'}, 
            General Mock: {isMockMode ? 'Enabled' : 'Disabled'}
          </p>
          {isMockMetaMode && (
            <Button
              variant="outline"
              size="sm"
              onClick={disableMockMode}
              className="border-yellow-500 hover:bg-yellow-100"
            >
              Disable Meta API Mock Mode
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default MockModePanel;
