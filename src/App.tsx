
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

// Enhanced global mock mode detection function with safeguards
export const isMockMode = (): boolean => {
  try {
    // First check if we're in a browser environment at all
    if (typeof window === 'undefined') {
      return false;
    }
    
    // Then safely check localStorage
    if (typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem("USE_MOCK_MODE") === "true";
      } catch (e) {
        console.error("Error accessing localStorage for mock mode check:", e);
      }
    }
    
    // If localStorage access failed, try URL parameters
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('mock') === 'true';
    } catch (e) {
      console.error("Error checking URL parameters for mock mode:", e);
    }
    
    return false;
  } catch (e) {
    // Catch any unexpected errors and default to false
    console.error("Unexpected error checking mock mode:", e);
    return false;
  }
};

function App() {
  const [isMockModeActive, setIsMockModeActive] = useState(false);

  // Only run in browser environment
  useEffect(() => {
    try {
      // Double check we're in browser
      if (typeof window === 'undefined') return;
      
      // Check for mock mode on initial load with error handling
      let mockEnabled = false;
      
      try {
        const urlParams = new URLSearchParams(window.location.search);
        mockEnabled = urlParams.get('mock') === 'true';
      } catch (urlError) {
        console.error("Error checking URL parameters:", urlError);
      }
      
      setIsMockModeActive(mockEnabled);
      
      // Only attempt localStorage operations if available
      if (typeof localStorage !== 'undefined') {
        try {
          // Store in localStorage for consistent global access
          localStorage.setItem("USE_MOCK_MODE", mockEnabled ? "true" : "false");
          
          if (mockEnabled) {
            console.log('[ROOT APP] Mock mode detected - using simulated data');
            
            toast({
              title: "🎭 Mock Data Mode Active",
              description: "Using simulated data instead of connecting to Meta API",
              duration: 5000,
            });
            
            // Store additional information
            localStorage.setItem('mock_mode_enabled', 'true');
            localStorage.setItem('mock_mode_enabled_at', new Date().toISOString());
            
            // Pre-populate required states to ensure UI works correctly
            localStorage.setItem('selected_ad_account', 'act_123456789');
            localStorage.setItem('meta_auth_token', 'mock_token_123456789');
            
            // Dispatch event to notify components about mock mode
            window.dispatchEvent(new CustomEvent('mock-mode-enabled'));
          } else {
            localStorage.removeItem('mock_mode_enabled');
            localStorage.removeItem('USE_MOCK_MODE');
          }
        } catch (storageError) {
          console.error("Error manipulating localStorage:", storageError);
        }
      }
    } catch (e) {
      console.error("Error in mock mode initialization:", e);
    }
  }, []);

  return (
    <SharedMetaConnectionProvider>
      <BrowserRouter>
        {isMockModeActive && (
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
