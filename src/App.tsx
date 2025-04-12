
import React, { Suspense, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Campaigns from './pages/Campaigns';
import Analytics from './pages/Analytics';
import Audience from './pages/Audience';
import Events from './pages/Events';
import Messages from './pages/Messages';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import DataDeletion from './pages/DataDeletion';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Contact from './pages/Contact';
import NotFound from './pages/NotFound';
import Import from './pages/Import';
import Clients from './pages/admin/Clients';
import Pipeline from './pages/admin/Pipeline';
import Performance from './pages/admin/Performance';
import MetaIntegration from './pages/MetaIntegration';
import './App.css';

const App: React.FC = () => {
  return (
    <Router>
      <Suspense fallback={<div className="p-8">Loading...</div>}>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/audience" element={<Audience />} />
          <Route path="/events" element={<Events />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/import" element={<Import />} />
          <Route path="/meta-integration" element={<MetaIntegration />} />
          <Route path="/admin/clients" element={<Clients />} />
          <Route path="/admin/pipeline" element={<Pipeline />} />
          <Route path="/admin/performance" element={<Performance />} />
          <Route path="/data-deletion" element={<DataDeletion />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
