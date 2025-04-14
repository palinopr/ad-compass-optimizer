
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import MetaIntegration from '@/pages/MetaIntegration';
import Campaigns from '@/pages/Campaigns';
import Messages from '@/pages/Messages';
import Profile from '@/pages/Profile';
import { SharedMetaConnectionProvider } from '@/components/meta/SharedMetaConnectionProvider';
import { Toaster } from '@/components/ui/toaster';
import FunnelViewContainer from '@/components/funnel/FunnelViewContainer';
import { toast } from './hooks/use-toast';

function App() {
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    // Check for mock mode on initial load
    const urlParams = new URLSearchParams(window.location.search);
    const mockEnabled = urlParams.get('mock') === 'true';
    
    setIsMockMode(mockEnabled);
    
    if (mockEnabled) {
      console.log('[ROOT APP] Mock mode detected - using simulated data');
      toast({
        title: "🎭 Mock Data Mode Active",
        description: "Using simulated data instead of connecting to Meta API",
        duration: 5000,
      });
      
      // Store in localStorage for diagnostic purposes
      localStorage.setItem('mock_mode_enabled', 'true');
      localStorage.setItem('mock_mode_enabled_at', new Date().toISOString());
    } else {
      localStorage.removeItem('mock_mode_enabled');
    }
  }, []);

  return (
    <SharedMetaConnectionProvider>
      <BrowserRouter>
        {isMockMode && (
          <div className="bg-yellow-400 text-black text-center py-1 text-sm font-medium">
            🎭 Mock Data Mode Active - Using Simulated Data
          </div>
        )}
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
      </BrowserRouter>
      <Toaster />
    </SharedMetaConnectionProvider>
  );
}

export default App;
