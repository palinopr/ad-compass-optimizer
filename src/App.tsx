
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { SharedMetaConnectionProvider } from '@/components/meta/SharedMetaConnectionProvider';
import { Toaster } from '@/components/ui/toaster';
import AppRoutes from '@/components/app/AppRoutes';
import { QueueVisualizer } from '@/components/queue/QueueVisualizer';

function App() {
  return (
    <SharedMetaConnectionProvider>
      <div style={{ 
        background: '#e6ffe6', 
        padding: '20px', 
        margin: '10px', 
        textAlign: 'center',
        border: '2px solid green',
        borderRadius: '8px'
      }}>
        ✅ App Mounted Successfully - React Rendering Confirmed
      </div>
      
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      
      <QueueVisualizer />
      <Toaster />
    </SharedMetaConnectionProvider>
  );
}

export default App;
