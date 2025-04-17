
import React, { useEffect, useState } from 'react';
import { ArrowDown, Check, Clock, Loader2, List, Ban, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { QueueStats } from '@/services/api/insights/throttling/queue/types/QueueTypes';
import { strictSequentialQueue } from '@/services/api/insights/throttling/queue/QueueManager';

export function QueueVisualizer() {
  const [stats, setStats] = useState<QueueStats>({
    queueSize: 0,
    isProcessing: false,
    activeRequests: 0
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const currentStats = strictSequentialQueue.getStats();
      setStats(currentStats);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="fixed bottom-4 right-4 w-64 shadow-lg border-2 bg-white/90 backdrop-blur z-50">
      <CardHeader className="p-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <List className="h-4 w-4" />
          Insights Queue Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Queue Size:</span>
          <Badge variant={stats.queueSize > 0 ? "secondary" : "outline"}>
            {stats.queueSize} requests
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Badge 
            variant={stats.isProcessing ? "success" : "secondary"}
            className="flex items-center gap-1"
          >
            {stats.isProcessing ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                Processing
              </>
            ) : stats.queueSize > 0 ? (
              <>
                <Clock className="h-3 w-3" />
                Waiting
              </>
            ) : (
              <>
                <Check className="h-3 w-3" />
                Idle
              </>
            )}
          </Badge>
        </div>

        {stats.isProcessing && (
          <div className="text-xs text-muted-foreground text-center pt-1">
            Processing request...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
