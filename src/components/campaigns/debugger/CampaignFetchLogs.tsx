
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, BarChart } from 'lucide-react';
import CampaignFetchLogger from '@/utils/debugging/campaignFetchLogger';
import { Badge } from '@/components/ui/badge';

const CampaignFetchLogs = () => {
  const [logs, setLogs] = useState<any[]>([]);
  
  useEffect(() => {
    // Initialize with existing logs
    setLogs(CampaignFetchLogger.getLogs());
    
    // Listen for new logs
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
        <ScrollArea className="h-[200px] rounded-md border p-2">
          {logs.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              No campaign fetch logs yet
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div key={index} className="text-xs border-b pb-2">
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
                      {log.parsedJson && (
                        <div className="mt-1">
                          Campaigns: {log.parsedJson.data?.length || 0}
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
