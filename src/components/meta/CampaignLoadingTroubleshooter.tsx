
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Briefcase } from 'lucide-react';
import AdAccountSelector from './AdAccountSelector';
import { metaAuthService } from '@/services/MetaAuthService';
import { useToast } from '@/hooks/use-toast';

interface CampaignLoadingTroubleshooterProps {
  errorDetails?: any;
  onRetry: () => void;
}

const CampaignLoadingTroubleshooter: React.FC<CampaignLoadingTroubleshooterProps> = ({
  errorDetails,
  onRetry
}) => {
  const { toast } = useToast();
  const tokenSource = metaAuthService.getTokenSource();
  
  // Check for specific error types
  const isPermissionError = errorDetails?.error?.message?.toLowerCase().includes('permission') || 
                            errorDetails?.error?.code === 200 ||
                            errorDetails?.error?.code === 10;
  
  const isAccountError = errorDetails?.error?.message?.toLowerCase().includes('account') ||
                         !localStorage.getItem('selected_ad_account');
  
  const handleRefreshSession = () => {
    metaAuthService.logout();
    localStorage.setItem('show_meta_connection', 'true');
    toast({
      title: "Session Reset",
      description: "Your Facebook session will be refreshed. Please log in again."
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-amber-800 flex items-center text-lg">
          <AlertCircle className="mr-2 h-5 w-5" />
          Campaign Loading Issue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-amber-800">
          <p className="mb-2">
            You're successfully logged in with Facebook, but we're still having trouble loading your campaigns.
            This typically happens due to one of these reasons:
          </p>
          
          <ul className="list-disc pl-5 space-y-1">
            <li>No ad account is selected or the selection is incorrect</li>
            <li>Your Facebook account lacks necessary permissions for the selected ad account</li>
            <li>Your Facebook session needs to be refreshed</li>
          </ul>
        </div>
        
        {isPermissionError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-700 font-medium">Permission Error Detected</p>
            <p className="text-sm text-red-600 mt-1">
              Your account doesn't have permission to access this ad account's data. 
              Try selecting a different ad account or log in with a Facebook account that has admin access to your ads.
            </p>
          </div>
        )}
        
        <div className="bg-white border rounded-md p-4">
          <h3 className="font-medium flex items-center mb-2">
            <Briefcase className="h-4 w-4 mr-2" />
            Ad Account Selection
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Make sure you've selected the correct ad account that contains your campaigns.
          </p>
          
          <AdAccountSelector />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 justify-end">
          <Button 
            variant="outline" 
            onClick={onRetry}
            className="flex items-center"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry Loading Campaigns
          </Button>
          
          <Button 
            variant="default"
            onClick={handleRefreshSession}
            className="bg-meta-blue hover:bg-meta-dark"
          >
            Refresh Facebook Session
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignLoadingTroubleshooter;
