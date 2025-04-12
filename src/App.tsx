
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import MetaIntegration from '@/pages/MetaIntegration';
import Campaigns from '@/pages/Campaigns';
import { SharedMetaConnectionProvider } from '@/components/meta/SharedMetaConnectionProvider';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <SharedMetaConnectionProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/meta-integration" element={<MetaIntegration />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/messages" element={<Campaigns />} /> {/* Using Campaigns component for the messages route */}
          <Route path="/analytics" element={<Dashboard />} /> 
          <Route path="/audiences" element={<Dashboard />} />
          <Route path="/events" element={<Dashboard />} />
          <Route path="/reports" element={<Dashboard />} />
          <Route path="/settings" element={<MetaIntegration />} /> {/* Using MetaIntegration for settings too */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </SharedMetaConnectionProvider>
  );
}

export default App;
