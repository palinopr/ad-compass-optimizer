
import React from 'react';

interface RecentFixNotificationProps {
  recentlyFixed: boolean;
}

const RecentFixNotification: React.FC<RecentFixNotificationProps> = ({ recentlyFixed }) => {
  if (!recentlyFixed) return null;

  return (
    <div className="text-xs bg-green-50 p-2 border border-green-200 rounded mt-1">
      <p className="font-medium text-green-700">Fix Recently Applied</p>
      <p>UI refresh has been completed. Your campaigns should now be visible.</p>
      <p className="mt-1">If you still don't see your data, try navigating to the Campaigns page.</p>
    </div>
  );
};

export default RecentFixNotification;
