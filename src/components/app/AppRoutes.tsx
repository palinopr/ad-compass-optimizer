
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import MetaIntegration from '@/pages/MetaIntegration';
import Campaigns from '@/pages/Campaigns';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';
import FunnelViewContainer from '@/components/funnel/FunnelViewContainer';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/meta-integration" element={<MetaIntegration />} />
      <Route path="/campaigns" element={<Campaigns />} />
      <Route path="/funnel" element={<FunnelViewContainer />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/analytics" element={<Dashboard />} /> 
      <Route path="/audiences" element={<Dashboard />} />
      <Route path="/events" element={<Dashboard />} />
      <Route path="/reports" element={<Dashboard />} />
      <Route path="/settings" element={<MetaIntegration />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
