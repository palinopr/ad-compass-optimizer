
import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SharedMetaConnectionProvider } from '@/components/meta/SharedMetaConnectionProvider';
import { Toaster } from '@/components/ui/toaster';
import AppInitializer from '@/components/app/AppInitializer';
import MockModeDetector from '@/components/app/MockModeDetector';
import BuildInfo from '@/components/app/BuildInfo';
import AppRoutes from '@/components/app/AppRoutes';

function App() {
  const [isMockModeActive, setIsMockModeActive] = useState(false);
  const [buildInfo, setBuildInfo] = useState('');
  const [appLoaded, setAppLoaded] = useState(false);

  const handleInitialized = (buildInfoValue: string) => {
    setBuildInfo(buildInfoValue);
    setAppLoaded(true);
  };

  // Fallback UI in case of issues
  if (!appLoaded) {
    return (
      <div style={{ padding: "20px", background: "#f0f0f0", margin: "20px" }}>
        <h2>🔄 App Loading...</h2>
        <p>Please wait while the application initializes.</p>
      </div>
    );
  }

  return (
    <SharedMetaConnectionProvider>
      <div style={{ background: '#e6ffe6', padding: '8px', margin: '0', textAlign: 'center' }}>
        ✅ App Loaded Successfully - DOM Rendering Test
      </div>
      
      <AppInitializer onInitialized={handleInitialized} />
      <MockModeDetector onDetected={setIsMockModeActive} />
      
      <BrowserRouter>
        {isMockModeActive && (
          <div className="bg-yellow-400 text-black text-center py-1 text-sm font-medium">
            🎭 Mock Data Mode Active - Using Simulated Data
          </div>
        )}
        <BuildInfo buildInfo={buildInfo} />
        <AppRoutes />
      </BrowserRouter>
      <Toaster />
    </SharedMetaConnectionProvider>
  );
}

export default App;
