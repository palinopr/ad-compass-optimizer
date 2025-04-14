
import React from 'react';
import CampaignsQuickAccess from '@/components/dashboard/CampaignsQuickAccess';
import ProfileQuickAccess from '@/components/dashboard/ProfileQuickAccess';
import InsightsDemoCard from '@/components/insights/InsightsDemoCard';

const DashboardCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <CampaignsQuickAccess />
      <ProfileQuickAccess />
      <InsightsDemoCard />
    </div>
  );
};

export default DashboardCards;
