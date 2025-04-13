
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';
import ConnectionTab from './tabs/ConnectionTab';
import TokenTab from './tabs/TokenTab';
import DataTab from './tabs/DataTab';

interface DiagnosticTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  diagnosticResults: any;
  runningDiagnostic: boolean;
  runDiagnostic: () => void;
}

export const DiagnosticTabs: React.FC<DiagnosticTabsProps> = ({
  activeTab,
  setActiveTab,
  diagnosticResults,
  runningDiagnostic,
  runDiagnostic
}) => {
  // Check if we have a rate limit issue
  const rateLimitTimestamp = localStorage.getItem('meta_rate_limit_timestamp');
  const hasRateLimit = !!rateLimitTimestamp;
  
  // Check if rate limit is recent (within last 5 minutes)
  const isRecentRateLimit = React.useMemo(() => {
    if (!rateLimitTimestamp) return false;
    
    const limitTime = new Date(rateLimitTimestamp).getTime();
    const now = new Date().getTime();
    const minutesSince = Math.floor((now - limitTime) / (1000 * 60));
    
    return minutesSince < 5;
  }, [rateLimitTimestamp]);
  
  // If we have a recent rate limit, default to the data tab
  React.useEffect(() => {
    if (isRecentRateLimit && activeTab !== 'data') {
      setActiveTab('data');
    }
  }, [isRecentRateLimit, activeTab, setActiveTab]);
  
  if (runningDiagnostic) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Running diagnostic...</span>
      </div>
    );
  }
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="w-full">
        <TabsTrigger value="connection" className="flex-1">
          Connection
        </TabsTrigger>
        <TabsTrigger value="token" className="flex-1">
          Token
        </TabsTrigger>
        <TabsTrigger value="data" className="flex-1">
          {hasRateLimit ? (
            <span className="flex items-center">
              Data
              <span className="ml-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </span>
          ) : (
            "Data"
          )}
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="connection" className="pt-4">
        <ConnectionTab 
          diagnosticResults={diagnosticResults} 
          runDiagnostic={runDiagnostic}
        />
      </TabsContent>
      
      <TabsContent value="token" className="pt-4">
        <TokenTab 
          diagnosticResults={diagnosticResults} 
          runDiagnostic={runDiagnostic}
        />
      </TabsContent>
      
      <TabsContent value="data" className="pt-4">
        <DataTab 
          diagnosticResults={diagnosticResults} 
          runDiagnostic={runDiagnostic}
        />
      </TabsContent>
    </Tabs>
  );
};
