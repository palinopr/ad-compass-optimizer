
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useCreativeRotation, type CreativePerformance } from '@/hooks/funnel/useCreativeRotation';

interface CreativeRotationBoxProps {
  creatives: any[];
  creationDates?: { [key: string]: string };
}

const CreativeRotationBox: React.FC<CreativeRotationBoxProps> = ({
  creatives,
  creationDates
}) => {
  const { performanceData, isLoading, error } = useCreativeRotation(creatives, creationDates);

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Creative Rotation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Creative Rotation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  const needsRefresh = performanceData.filter(c => c.status === 'needs-refresh');
  const topPerformers = performanceData.filter(c => c.isTopPerformer);

  if (needsRefresh.length === 0 && topPerformers.length === 0) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Creative Rotation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            All creatives performing well - no rotation needed at this time.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Creative Rotation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {needsRefresh.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Due for Refresh
              </h3>
              {needsRefresh.map((creative) => (
                <div 
                  key={creative.id}
                  className="p-2 bg-yellow-50 rounded-lg flex items-start gap-2"
                >
                  <span className="text-lg">⚠️</span>
                  <div className="space-y-1">
                    <p className="text-sm">
                      Creative #{creative.id.slice(-4)} ({creative.age} days old)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Performance {creative.metrics.recentTrend} - Consider refreshing
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {topPerformers.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                Top Performers - Create Variations
              </h3>
              {topPerformers.map((creative) => (
                <div 
                  key={creative.id}
                  className="p-2 bg-green-50 rounded-lg flex items-start gap-2"
                >
                  <span className="text-lg">⭐</span>
                  <div className="space-y-1">
                    <p className="text-sm">
                      Creative #{creative.id.slice(-4)} (CTR: {(creative.metrics.ctr * 100).toFixed(1)}%)
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Strong performer - Use as template for new variations
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CreativeRotationBox;
