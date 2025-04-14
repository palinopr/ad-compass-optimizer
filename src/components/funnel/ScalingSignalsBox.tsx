
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { useScalingSignals, type ScalingSignal } from '@/hooks/funnel/useScalingSignals';

interface ScalingSignalsBoxProps {
  itemId: string;
  targetCPA?: number;
}

const ScalingSignalsBox: React.FC<ScalingSignalsBoxProps> = ({
  itemId,
  targetCPA
}) => {
  const { scalingSignal, isLoading, error } = useScalingSignals(itemId, targetCPA);

  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Scaling Signals</CardTitle>
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
          <CardTitle>Scaling Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!scalingSignal || !targetCPA) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Scaling Signals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground">
            Set a target CPA to receive scaling recommendations
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: ScalingSignal['status']) => {
    switch (status) {
      case 'eligible':
        return 'bg-green-50';
      case 'slow-scale':
        return 'bg-blue-50';
      case 'watch':
        return 'bg-yellow-50';
      case 'pause':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Scaling Signals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`p-4 rounded-lg ${getStatusColor(scalingSignal.status)}`}>
          <div className="flex items-start gap-3">
            <span className="text-xl">{scalingSignal.icon}</span>
            <div className="space-y-1">
              <p className="font-medium">{scalingSignal.message}</p>
              {scalingSignal.details && (
                <div className="text-sm text-muted-foreground">
                  {scalingSignal.details.daysUnderTarget && (
                    <p>{scalingSignal.details.daysUnderTarget} days under target CPA</p>
                  )}
                  {scalingSignal.details.cpaChange && (
                    <p>CPA changed by {scalingSignal.details.cpaChange.toFixed(1)}%</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScalingSignalsBox;
