
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { InfoIcon, AlertTriangle, PlusCircle, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface NoCampaignsFoundPanelProps {
  onRefresh: () => void;
  onCreateCampaign?: () => void;
  isLoading?: boolean;
}

const NoCampaignsFoundPanel: React.FC<NoCampaignsFoundPanelProps> = ({
  onRefresh,
  onCreateCampaign,
  isLoading = false
}) => {
  // Check if we have adsets without campaigns (unusual but possible)
  const hasAdsets = localStorage.getItem('has_adsets') === 'true';
  const adsetCount = parseInt(localStorage.getItem('adset_count') || '0');
  const selectedAccount = localStorage.getItem('selected_ad_account');
  
  return (
    <Card className="mt-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <InfoIcon className="h-5 w-5 mr-2 text-blue-500" />
          No Campaigns Found
        </CardTitle>
        <CardDescription>
          We couldn't find any campaigns in the selected ad account
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Ad Account Information</AlertTitle>
          <AlertDescription>
            The selected ad account (ID: {selectedAccount}) doesn't contain any campaigns.
            {hasAdsets ? ` However, we found ${adsetCount} adset(s) in this account.` : ''}
          </AlertDescription>
        </Alert>
        
        <div className="text-sm space-y-2">
          <h3 className="font-medium">What you can do:</h3>
          
          <ol className="list-decimal pl-5 space-y-2">
            <li>Select a different ad account that contains campaigns</li>
            <li>Create a new campaign in this ad account</li>
            <li>Verify permissions for this ad account in Meta Business Manager</li>
          </ol>
        </div>
        
        <Separator />
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button 
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Ad Account'}
          </Button>
          
          {onCreateCampaign && (
            <Button
              onClick={onCreateCampaign}
              className="flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Create Campaign
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NoCampaignsFoundPanel;
