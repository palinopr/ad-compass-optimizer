
import React from 'react';

// Format numbers with commas
const formatNumber = (value: string | undefined): string => {
  if (!value) return '-';
  
  // If already formatted or not a number, return as is
  if (value === '-' || isNaN(Number(value.replace(/[,$]/g, '')))) {
    return value;
  }
  
  const num = parseFloat(value.replace(/[,$]/g, ''));
  return new Intl.NumberFormat('en-US').format(num);
};

// Format currency values
const formatCurrency = (value: string | undefined): string => {
  if (!value || value === '-') return '-';
  
  // If it's already formatted with a dollar sign, return as is
  if (value.startsWith('$')) return value;
  
  // Try to parse as a number
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '-';
  
  // Format as USD
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

export const getMetricDisplay = (value: string | undefined, isMonetary: boolean = false): string => {
  if (!value) return '-';
  return isMonetary ? formatCurrency(value) : formatNumber(value);
};

export const renderMetrics = (item: any) => {
  const spend = getMetricDisplay(
    item.insights?.spend || 
    (typeof item.spend === 'string' ? item.spend : undefined),
    true
  );
  
  const impressions = getMetricDisplay(item.insights?.impressions);
  const clicks = getMetricDisplay(item.insights?.clicks);
  
  // Debug insights issues
  if (!item.insights || Object.keys(item.insights).length === 0) {
    console.warn(`[METRICS] Item is missing insights data:`, {
      id: item.id,
      name: item.name,
      type: item.adset_id ? 'ad' : item.campaign_id ? 'adset' : 'campaign'
    });
  }
  
  return (
    <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
      <div>
        <span className="font-medium">Spend:</span> {spend}
      </div>
      <div>
        <span className="font-medium">Status:</span>{' '}
        <span className={item.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-500'}>
          {item.status?.toLowerCase() || '-'}
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
