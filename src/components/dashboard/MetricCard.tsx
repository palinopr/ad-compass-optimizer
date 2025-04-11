
import React from 'react';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ReactNode;
  className?: string;
}

const MetricCard = ({ title, value, change, icon, className }: MetricCardProps) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <Card className={cn("p-4 flex flex-col space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className="p-2 rounded-md bg-gray-100 text-gray-600">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold">{value}</span>
        {change !== undefined && (
          <div className={cn(
            "flex items-center text-sm font-medium",
            isPositive ? "text-green-600" : isNegative ? "text-red-600" : "text-gray-500"
          )}>
            {isPositive ? (
              <ArrowUpIcon className="w-3 h-3 mr-1" />
            ) : isNegative ? (
              <ArrowDownIcon className="w-3 h-3 mr-1" />
            ) : null}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
