
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useCreativeFatigue } from '@/hooks/funnel/useCreativeFatigue';
import { useCpaPacing } from '@/hooks/funnel/useCpaPacing';

interface PerformanceAlertsProps {
  itemId: string;
  creationDate?: string;
  targetCPA?: number;
}

const PerformanceAlerts: React.FC<PerformanceAlertsProps> = ({
  itemId,
  creationDate,
  targetCPA
}) => {
  const { fatigueStatus, isLoading: fatigueLoading, error: fatigueError } = useCreativeFatigue(itemId, creationDate);
  const { cpaStatus, isLoading: cpaLoading, error: cpaError } = useCpaPacing(itemId, targetCPA);

  if (fatigueLoading || cpaLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Performance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (fatigueError || cpaError) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Performance Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">
            {fatigueError || cpaError}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Performance Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {fatigueStatus && (
            <div className="border-b pb-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{fatigueStatus.icon}</span>
                <span className="font-medium">{fatigueStatus.message}</span>
              </div>
              {fatigueStatus.metrics && (
                <div className="text-sm text-gray-600 space-y-1">
                  <div>CTR Change: {fatigueStatus.metrics.ctrChange.toFixed(1)}%</div>
                  <div>CPM Change: {fatigueStatus.metrics.cpmChange.toFixed(1)}%</div>
                  <div>Conversion Rate Change: {fatigueStatus.metrics.conversionRateChange.toFixed(1)}%</div>
                </div>
              )}
            </div>
          )}

          {cpaStatus && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{cpaStatus.icon}</span>
                <span className="font-medium">{cpaStatus.message}</span>
              </div>
              <div className="text-sm text-gray-600">
                <div>Current CPA: ${cpaStatus.currentCPA.toFixed(2)}</div>
                {cpaStatus.targetCPA && (
                  <div>Target CPA: ${cpaStatus.targetCPA.toFixed(2)}</div>
                )}
                {cpaStatus.daysLow && (
                  <div>Days Below Target: {cpaStatus.daysLow}</div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceAlerts;
