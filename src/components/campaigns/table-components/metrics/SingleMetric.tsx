
import React from 'react';

interface SingleMetricProps {
  value: string;
  isBlocked?: boolean;
  additionalClasses?: string;
}

export const SingleMetric: React.FC<SingleMetricProps> = ({ 
  value, 
  isBlocked = false,
  additionalClasses = ''
}) => {
  return (
    <div className={`${isBlocked ? 'text-gray-400' : 'text-gray-600'} ${additionalClasses}`}>
      {value}
    </div>
  );
};
