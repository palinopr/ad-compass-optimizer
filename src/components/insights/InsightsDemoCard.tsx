
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useMetaInsights } from '@/hooks/insights/useMetaInsights';
import { useAdAccountSelection } from '@/hooks/campaigns/useAdAccountSelection';
import { BarChart, Calendar, RefreshCcw } from 'lucide-react';
import { InsightFilterOptions } from '@/services/api/MetaInsightsService';

const InsightsDemoCard = () => {
  const { insights, isLoading, error, fetchAccountInsights } = useMetaInsights();
  const { getSelectedAdAccount } = useAdAccountSelection();
  const [dateRange, setDateRange] = useState('last_30d');
  
  const handleFetchInsights = async () => {
    const accountResult = getSelectedAdAccount();
    
    if (!accountResult.hasAccount) {
      return;
    }
    
    const options: InsightFilterOptions = {
      datePreset: 'last_30d' as any,
      fields: ['impressions', 'clicks', 'spend', 'reach'],
      level: 'account'
    };
    
    await fetchAccountInsights(accountResult.adAccountId, options);
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart className="w-5 h-5" />
          Meta Insights Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm">Last 30 days</span>
          </div>
          <Button 
            onClick={handleFetchInsights} 
            variant="secondary" 
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <RefreshCcw className="w-4 h-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCcw className="w-4 h-4 mr-2" />
                Fetch Insights
              </>
            )}
          </Button>
        </div>
        
        {error && (
          <div className="text-sm p-3 bg-red-50 border border-red-200 rounded text-red-600">
            {error}
          </div>
        )}
        
        {insights && insights.data && (
          <div className="space-y-2 mt-2">
            <p className="font-medium text-sm">Key Metrics:</p>
            <div className="grid grid-cols-2 gap-2">
              {insights.data[0]?.impressions && (
                <div className="p-3 bg-blue-50 rounded">
                  <p className="text-xs text-gray-500">Impressions</p>
                  <p className="font-semibold">{Number(insights.data[0].impressions).toLocaleString()}</p>
                </div>
              )}
              
              {insights.data[0]?.clicks && (
                <div className="p-3 bg-green-50 rounded">
                  <p className="text-xs text-gray-500">Clicks</p>
                  <p className="font-semibold">{Number(insights.data[0].clicks).toLocaleString()}</p>
                </div>
              )}
              
              {insights.data[0]?.spend && (
                <div className="p-3 bg-yellow-50 rounded">
                  <p className="text-xs text-gray-500">Spend</p>
                  <p className="font-semibold">${Number(insights.data[0].spend).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}</p>
                </div>
              )}
              
              {insights.data[0]?.reach && (
                <div className="p-3 bg-purple-50 rounded">
                  <p className="text-xs text-gray-500">Reach</p>
                  <p className="font-semibold">{Number(insights.data[0].reach).toLocaleString()}</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {!insights && !error && !isLoading && (
          <div className="text-center p-4">
            <p className="text-sm text-gray-500">Click the button above to fetch insights data</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InsightsDemoCard;
