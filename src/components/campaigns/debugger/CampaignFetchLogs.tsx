
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BarChart, AlertCircle } from 'lucide-react';
import CampaignFetchLogger from '@/utils/debugging/campaignFetchLogger';
import { Badge } from '@/components/ui/badge';

const CampaignFetchLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  
  useEffect(() => {
    setLogs(CampaignFetchLogger.getLogs());
    
    const handleNewLog = (event: CustomEvent) => {
      setLogs(prev => [event.detail, ...prev].slice(0, 10));
    };
    
    window.addEventListener('campaign-fetch-log', handleNewLog as EventListener);
    return () => {
      window.removeEventListener('campaign-fetch-log', handleNewLog as EventListener);
    };
  }, []);

  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Campaign Fetch Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] rounded-md border p-2">
          {logs.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No campaign fetch logs yet
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={index} className="text-xs border-b pb-4">
                  <div className="flex justify-between text-gray-500">
                    <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    <span>Account: {log.accountId}</span>
                  </div>
                  
                  {log.error ? (
                    <div className="text-red-500 mt-1">Error: {log.error}</div>
                  ) : (
                    <>
                      <div className="mt-1 flex justify-between items-center">
                        <span>Status: {log.status} {log.statusText}</span>
                        {typeof log.insightsData !== 'undefined' && (
                          <Badge 
                            variant={log.insightsData ? "default" : "outline"} 
                            className={log.insightsData ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"}
                          >
                            <BarChart className="h-3 w-3 mr-1" />
                            {log.insightsData ? "Insights ✓" : "No Insights"}
                          </Badge>
                        )}
                      </div>

                      {log.campaignPreviews && log.campaignPreviews.length > 0 && (
                        <div className="mt-2 space-y-2">
                          <div className="text-gray-600 font-medium">Campaign Previews:</div>
                          {log.campaignPreviews.map((campaign: any, idx: number) => (
                            <div key={idx} className="pl-2 border-l-2 border-gray-200">
                              <div className="grid grid-cols-2 gap-x-2 text-[10px]">
                                <span className="text-gray-500">ID:</span>
                                <span>{campaign.id}</span>
                                <span className="text-gray-500">Name:</span>
                                <span>{campaign.name}</span>
                                <span className="text-gray-500">Status:</span>
                                <span>{campaign.status}</span>
                                <span className="text-gray-500">Spend:</span>
                                <span>{campaign.spend}</span>
                                <span className="text-gray-500">Results:</span>
                                <span>{campaign.results}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {log.queryParams && (
                        <div className="mt-2 text-[10px] text-gray-500">
                          Query: {log.queryParams}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CampaignFetchLogs;
