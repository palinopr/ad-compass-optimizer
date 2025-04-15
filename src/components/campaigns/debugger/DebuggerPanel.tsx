
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import MetaApiCallLogs from './MetaApiCallLogs';
import AdAccountDebug from './AdAccountDebug';
import CampaignFetchStatus from './CampaignFetchStatus';
import MockModeStatus from './MockModeStatus';

interface DebuggerPanelProps {
  campaigns: any[];
  isLoading: boolean;
  error: string | null;
}

const DebuggerPanel: React.FC<DebuggerPanelProps> = ({ 
  campaigns, 
  isLoading, 
  error
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedAccount = localStorage.getItem('selected_ad_account');

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="my-4"
    >
      <Card className="border-blue-200 bg-blue-50/40">
        <CardHeader className="pb-2">
          <CollapsibleTrigger asChild>
            <div className="flex justify-between items-center cursor-pointer">
              <CardTitle className="text-sm font-medium flex items-center text-blue-800">
                <Info className="w-4 h-4 mr-2" />
                Campaign Debugger
              </CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4">
            <div className="text-sm text-blue-700 mb-4">
              This panel shows real-time debugging information about campaign loading and Meta API interactions.
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <CampaignFetchStatus
                  campaigns={campaigns}
                  isLoading={isLoading}
                  error={error}
                />
              </div>
              <div>
                <AdAccountDebug selectedAccount={selectedAccount} />
              </div>
            </div>
            <MetaApiCallLogs />
            <MockModeStatus />
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
};

export default DebuggerPanel;
