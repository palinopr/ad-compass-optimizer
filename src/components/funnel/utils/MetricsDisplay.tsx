
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
  const clicks = getMetricDisplay(item.insights?.clicks);
  const spend = getMetricDisplay(item.insights?.spend, true);
  const results = getMetricDisplay(item.results);
  const cpa = getMetricDisplay(item.insights?.cpa, true);
  const roas = item.insights?.roas || '-';
  
  return (
    <div className="grid grid-cols-5 gap-4 text-sm text-gray-600">
      <div>
        <span className="font-medium">Clicks:</span> {clicks}
      </div>
      <div>
        <span className="font-medium">Spend:</span> {spend}
      </div>
      <div>
        <span className="font-medium">Results:</span> {results}
      </div>
      <div>
        <span className="font-medium">CPA:</span> {cpa}
      </div>
      <div>
        <span className="font-medium">ROAS:</span>{' '}
        <span className={parseFloat(roas) >= 2 ? 'text-green-600 font-medium' : ''}>
          {roas}
        </span>
      </div>
    </div>
  );
};
