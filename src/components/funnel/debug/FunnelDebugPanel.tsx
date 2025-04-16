
import React, { useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FunnelDebugPanelProps {
  lastRequestDetails: any;
  isLoading: boolean;
  testDirectApiCall: () => void;
  verifyPermissions: () => void;
  buildVersion: string;
  datePreset?: string;
}

const FunnelDebugPanel = ({ 
  lastRequestDetails, 
  isLoading, 
  testDirectApiCall, 
  verifyPermissions,
  buildVersion,
  datePreset = 'last_28d'
}: FunnelDebugPanelProps) => {
  const [currentPreset, setCurrentPreset] = useState(datePreset);
  const [presetTimestamp, setPresetTimestamp] = useState<string | null>(null);
  
  // Read the actual date_preset from localStorage
  useEffect(() => {
    const storedPreset = localStorage.getItem('current_date_preset');
    if (storedPreset) {
      setCurrentPreset(storedPreset);
    }
    
    const timestamp = localStorage.getItem('date_preset_timestamp');
    if (timestamp) {
      setPresetTimestamp(timestamp);
    }
    
    // Check every 5 seconds for updates
    const interval = setInterval(() => {
      const latestPreset = localStorage.getItem('current_date_preset');
      if (latestPreset && latestPreset !== currentPreset) {
        setCurrentPreset(latestPreset);
      }
      
      const latestTimestamp = localStorage.getItem('date_preset_timestamp');
      if (latestTimestamp !== presetTimestamp) {
        setPresetTimestamp(latestTimestamp);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [currentPreset, presetTimestamp]);
  
  // Format timestamp for display
  const formattedTimestamp = presetTimestamp 
    ? new Date(presetTimestamp).toLocaleTimeString() 
    : 'Unknown';
  
  return (
    <Card className="mb-4 bg-slate-50/50 border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-slate-800 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Debug Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="font-medium">Build Details</div>
            <div className="text-slate-600 pb-2">
              <div><span className="inline-block w-28">Version:</span> {buildVersion}</div>
              <div className="font-semibold text-green-700">
                <span className="inline-block w-28">Date Preset:</span> {currentPreset}
                {presetTimestamp && (
                  <span className="text-xs text-slate-500 ml-2">(as of {formattedTimestamp})</span>
                )}
              </div>
              <div><span className="inline-block w-28">Last Request:</span> {lastRequestDetails?.timestamp ? new Date(lastRequestDetails.timestamp).toLocaleTimeString() : 'None'}</div>
            </div>
            
            <div className="font-medium pt-1">Account Details</div>
            <div className="text-slate-600">
              <div><span className="inline-block w-28">Account ID:</span> {lastRequestDetails?.accountId || 'None'}</div>
              <div><span className="inline-block w-28">Token Length:</span> {lastRequestDetails?.tokenLength || 0} chars</div>
              <div><span className="inline-block w-28">Endpoint:</span> {lastRequestDetails?.endpoint || 'None'}</div>
            </div>
          </div>
          
          <div className="flex flex-col justify-center space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={testDirectApiCall} 
              disabled={isLoading}
              className="w-full"
            >
              <RefreshCw className={`h-3.5 w-3.5 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Test Direct API Call
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={verifyPermissions}
              disabled={isLoading}
              className="w-full"
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-2" />
              Verify Permissions
            </Button>
          </div>
        </div>
        
        {lastRequestDetails && (
          <div className="mt-4 pt-3 border-t border-slate-200">
            <div className="font-medium mb-1">Request Preview</div>
            <div className="bg-slate-100 p-2 rounded text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
              <span className="text-blue-600">GET</span> /v17.0/{lastRequestDetails.accountId}/campaigns
              <br />
              <span className="text-gray-500">fields=</span>
              <span className="text-emerald-600">
                id,name,...,insights.<span className="font-bold text-green-800 bg-green-100 px-1">date_preset({currentPreset})</span>{'{'}impressions,clicks,spend,...{'}'}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FunnelDebugPanel;
