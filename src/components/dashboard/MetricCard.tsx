
import React from 'react';
import { ArrowDownIcon, ArrowUpIcon, DollarSign, Ticket, CreditCard, TrendingUp, TrendingDown, Percent, Users, ShoppingCart, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  trend?: number;
  trendLabel?: string;
  trendDirection?: 'up' | 'down';
  trendDesired?: 'up' | 'down';
  icon?: React.ReactNode | string;
  className?: string;
}

const MetricCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  trendLabel = "vs. prev. period",
  trendDirection,
  trendDesired = 'up',
  icon, 
  className 
}: MetricCardProps) => {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  
  const isTrendPositive = trend !== undefined && trend > 0;
  const isTrendNegative = trend !== undefined && trend < 0;
  
  // Determine if the trend is good or bad based on desired direction
  const isTrendGood = trendDesired === 'up' ? isTrendPositive : isTrendNegative;
  const isTrendBad = trendDesired === 'up' ? isTrendNegative : isTrendPositive;

  // Render appropriate icon based on string name or use provided ReactNode
  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    
    switch(icon as string) {
      case 'ticket':
        return <Ticket className="w-4 h-4" />;
      case 'dollar-sign':
        return <DollarSign className="w-4 h-4" />;
      case 'credit-card':
        return <CreditCard className="w-4 h-4" />;
      case 'trending-up':
        return <TrendingUp className="w-4 h-4" />;
      case 'trending-down':
        return <TrendingDown className="w-4 h-4" />;
      case 'percent':
        return <Percent className="w-4 h-4" />;
      case 'users':
        return <Users className="w-4 h-4" />;
      case 'shopping-cart':
        return <ShoppingCart className="w-4 h-4" />;
      case 'x-circle':
        return <XCircle className="w-4 h-4" />;
      default:
        return icon;
    }
  };

  return (
    <Card className={cn("p-4 flex flex-col space-y-2", className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className="p-2 rounded-md bg-gray-100 text-gray-600">
          {renderIcon()}
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
      
      {trend !== undefined && (
        <div className={cn(
          "text-xs",
          isTrendGood ? "text-green-600" : isTrendBad ? "text-red-600" : "text-gray-500"
        )}>
          <span className="flex items-center">
            {trendDirection !== undefined ? (
              trendDirection === 'up' ? (
                <ArrowUpIcon className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownIcon className="w-3 h-3 mr-1" />
              )
            ) : isTrendPositive ? (
              <ArrowUpIcon className="w-3 h-3 mr-1" />
            ) : (
              <ArrowDownIcon className="w-3 h-3 mr-1" />
            )}
            {trend > 0 ? '+' : ''}{trend} {trendLabel}
          </span>
        </div>
      )}
    </Card>
  );
};

export default MetricCard;
