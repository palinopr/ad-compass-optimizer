
import React from 'react';

// App version info - make accessible to build info component
export const APP_VERSION = '1.0.2';
export const LAST_UPDATED = '2025-04-15';
export const INCLUDES_28D_FIX = true;

interface BuildInfoProps {
  buildInfo: string;
}

const BuildInfo: React.FC<BuildInfoProps> = ({ buildInfo }) => {
  if (!INCLUDES_28D_FIX || !buildInfo) {
    return null;
  }
  
  return (
    <div className="bg-green-100 text-green-800 text-center py-1 text-xs">
      ✅ Rebuilt with last_28d fix ({buildInfo})
    </div>
  );
};

export default BuildInfo;
