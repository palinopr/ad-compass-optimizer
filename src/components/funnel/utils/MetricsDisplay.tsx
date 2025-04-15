
import React from 'react';

export const getMetricDisplay = (value: string | undefined) => {
  if (!value) return '-';
  return value;
};

export const renderMetrics = (item: any) => {
  const spend = getMetricDisplay(
    item.insights?.spend || 
    (typeof item.spend === 'string' ? item.spend : undefined)
  );
  
  const impressions = getMetricDisplay(item.insights?.impressions);
  const clicks = getMetricDisplay(item.insights?.clicks);
  
  return (
    <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
      <div>
        <span className="font-medium">Spend:</span> {spend}
      </div>
      <div>
        <span className="font-medium">Status:</span>{' '}
        <span className={item.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}>
          {item.status?.toLowerCase()}
        </span>
      </div>
      <div>
        <span className="font-medium">Impressions:</span>{' '}
        {impressions}
      </div>
      <div>
        <span className="font-medium">Clicks:</span>{' '}
        {clicks}
      </div>
    </div>
  );
};
