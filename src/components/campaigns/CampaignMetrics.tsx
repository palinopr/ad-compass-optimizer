
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { MonitorSmartphone, MousePointerClick, DollarSign, BarChart3 } from 'lucide-react';

interface MetricItemProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  positive?: boolean;
}

const MetricItem: React.FC<MetricItemProps> = ({ label, value, icon, change, positive }) => {
  return (
    <div className="flex flex-col">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-muted rounded-md">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
      {change && (
        <p className={`text-xs mt-1 ${positive ? 'text-green-600' : 'text-red-600'}`}>
          {positive ? '↑' : '↓'} {change} vs. previous period
        </p>
      )}
    </div>
  );
};

interface CampaignMetricsProps {
  impressions: string;
  clicks: string;
  spend: string;
  cpa: string;
}

const CampaignMetrics: React.FC<CampaignMetricsProps> = ({
  impressions = '0',
  clicks = '0',
  spend = '$0.00',
  cpa = '$0.00'
}) => {
  return (
    <Card className="mb-4">
      <CardContent className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricItem 
            label="Impressions" 
            value={impressions} 
            icon={<MonitorSmartphone className="h-5 w-5 text-blue-600" />}
          />
          <MetricItem 
            label="Clicks" 
            value={clicks} 
            icon={<MousePointerClick className="h-5 w-5 text-green-600" />}
          />
          <MetricItem 
            label="Total Spend" 
            value={spend} 
            icon={<DollarSign className="h-5 w-5 text-red-600" />}
          />
          <MetricItem 
            label="Average CPA" 
            value={cpa} 
            icon={<BarChart3 className="h-5 w-5 text-purple-600" />}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignMetrics;
