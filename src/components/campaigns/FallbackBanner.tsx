
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface FallbackBannerProps {
  isUsingMaximumFallback: boolean;
  fallbackReason: string;
}

const FallbackBanner: React.FC<FallbackBannerProps> = ({ isUsingMaximumFallback, fallbackReason }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (isUsingMaximumFallback) {
      const timer = setTimeout(() => setIsVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isUsingMaximumFallback]);

  if (!isVisible || !isUsingMaximumFallback) return null;

  return (
    <div className="relative bg-amber-50 border border-amber-300 rounded-md p-3 text-sm flex items-center justify-between">
      <div>
        <h4 className="font-medium text-amber-800">Using fallback date range: Maximum</h4>
        <p className="text-amber-700 text-sm mt-1">
          No data found for Last 30 Days. {fallbackReason ? `Reason: ${fallbackReason}` : ''}
        </p>
      </div>
      <button 
        onClick={() => setIsVisible(false)}
        className="text-amber-600 hover:text-amber-800 transition-colors"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
};

export default FallbackBanner;
