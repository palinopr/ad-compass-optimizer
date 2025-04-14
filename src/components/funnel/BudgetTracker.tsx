
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BudgetTrackerProps {
  budgetStatus: {
    status: 'aligned' | 'behind' | 'over-accelerated' | 'unknown';
    statusIcon: string;
    message: string;
    spendToDate: number;
    spentPercentage: number;
    expectedMinPercentage?: number;
    expectedMaxPercentage?: number;
    projectedSpend?: number;
    projectedDate?: string;
  } | null;
  isLoading: boolean;
  error: string | null;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  budgetStatus,
  isLoading,
  error
}) => {
  if (isLoading) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Budget Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
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
          <CardTitle>Budget Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  if (!budgetStatus) {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Budget Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-gray-500">Select a campaign or ad set to view budget tracking</div>
        </CardContent>
      </Card>
    );
  }

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'aligned': return 'bg-green-500';
      case 'behind': return 'bg-yellow-500';
      case 'over-accelerated': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center">
          <span className="mr-2">Budget Tracker</span>
          <span className="text-lg">{budgetStatus.statusIcon}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="mb-2">{budgetStatus.message}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500 mb-1">Spend Progress</p>
            <div className="relative pt-1">
              <Progress 
                value={budgetStatus.spentPercentage > 100 ? 100 : budgetStatus.spentPercentage} 
                className={getProgressColor(budgetStatus.status)}
              />
              
              {/* Display expected range markers if available */}
              {budgetStatus.expectedMinPercentage !== undefined && budgetStatus.expectedMaxPercentage !== undefined && (
                <div className="relative h-0">
                  <div 
                    className="absolute bottom-0 w-1 h-3 bg-black" 
                    style={{ left: `${budgetStatus.expectedMinPercentage}%` }}
                  />
                  <div 
                    className="absolute bottom-0 w-1 h-3 bg-black" 
                    style={{ left: `${budgetStatus.expectedMaxPercentage}%` }}
                  />
                  <div 
                    className="absolute bottom-0 h-1 bg-gray-300" 
                    style={{ 
                      left: `${budgetStatus.expectedMinPercentage}%`,
                      width: `${budgetStatus.expectedMaxPercentage - budgetStatus.expectedMinPercentage}%`
                    }}
                  />
                </div>
              )}
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0%</span>
              <span>Spent: {budgetStatus.spentPercentage.toFixed(1)}%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium">Total Spend to Date</p>
            <p className="text-2xl font-bold">${budgetStatus.spendToDate.toFixed(2)}</p>
          </div>

          {budgetStatus.projectedSpend && budgetStatus.projectedDate && (
            <div className="border-t pt-3 mt-3">
              <p className="text-sm font-medium">30-Day Projection</p>
              <p className="text-lg">${budgetStatus.projectedSpend.toFixed(2)} by {budgetStatus.projectedDate}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetTracker;
