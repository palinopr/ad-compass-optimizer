
import React from 'react';
import { Rotate3D, RefreshCw } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';

interface CorsIssueSectionProps {
  hasCorsIssues: boolean;
  handleFullPageRefresh: () => void;
}

const CorsIssueSection: React.FC<CorsIssueSectionProps> = ({
  hasCorsIssues,
  handleFullPageRefresh
}) => {
  if (!hasCorsIssues) {
    return null;
  }

  return (
    <>
      <Separator className="my-2" />
      <div className="flex items-start gap-1 mt-2">
        <Rotate3D className="h-3 w-3 text-blue-500 mt-0.5" />
        <div>
          <p className="font-semibold">CORS Issues Detail:</p>
          <div className="space-y-1">
            <div className="text-xs bg-amber-50 p-2 border border-amber-200 rounded mt-1">
              <p className="font-medium">CORS Issues Despite Facebook Authentication</p>
              <p>This is unusual and may indicate:</p>
              <ul className="list-disc pl-4 mt-1 space-y-1">
                <li>Corporate network restrictions or proxies</li>
                <li>Security browser extensions interfering with requests</li>
                <li>Mixed content blocking from your browser</li>
                <li>VPN or firewall restrictions</li>
              </ul>
              
              <div className="mt-2 pt-2 border-t border-amber-200">
                <p className="font-medium">Try This Fix:</p>
                <Button 
                  variant="default" 
                  size="sm"
                  className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white h-8"
                  onClick={handleFullPageRefresh}
                >
                  <RefreshCw className="h-3 w-3 mr-1" />
                  Force Full Page Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CorsIssueSection;
