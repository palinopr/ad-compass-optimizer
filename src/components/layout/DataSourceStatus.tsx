
import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { RefreshCw } from 'lucide-react';

export const DataSourceStatus = () => {
  const [source, setSource] = useState<string>('');
  const [lastFetched, setLastFetched] = useState<string>('');

  useEffect(() => {
    const updateStatus = () => {
      const storedSource = localStorage.getItem('last_campaign_source') || '';
      const storedFetchTime = localStorage.getItem('last_campaign_fetch_at') || '';
      setSource(storedSource);
      setLastFetched(storedFetchTime);
    };

    updateStatus();
    window.addEventListener('storage', updateStatus);
    return () => window.removeEventListener('storage', updateStatus);
  }, []);

  if (!source) return null;

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return '';
    try {
      return format(new Date(timestamp), "MMM d · h:mm a");
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="px-2 py-3 border-t text-xs text-muted-foreground space-y-1">
      {lastFetched && (
        <div className="flex items-center gap-1">
          <RefreshCw className="h-3 w-3" />
          <span>Last Sync: {formatTimestamp(lastFetched)}</span>
        </div>
      )}
      <div className="flex items-center gap-1">
        {source === 'Mock Data' ? '🎭' : '📦'}
        <span>
          {source === 'Mock Data' ? 'Using Mock Campaigns' : `Source: ${source}`}
        </span>
      </div>
    </div>
  );
};
