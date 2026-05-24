import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Meetings from './pages/Meetings';
import Analytics from './pages/Analytics';
import './index.css';

function PlatformInbox({ platform }) {
  return <Inbox filterPlatform={platform} />;
}

function ComingSoon({ name }) {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-3 text-gray-400">
      <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center">
        <span className="text-white text-2xl font-bold">{name[0]}</span>
      </div>
      <p className="text-lg font-medium text-gray-600">{name}</p>
      <p className="text-sm">Coming soon</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/whatsapp" element={<PlatformInbox platform="whatsapp" />} />
            <Route path="/instagram" element={<PlatformInbox platform="instagram" />} />
            <Route path="/facebook" element={<PlatformInbox platform="facebook" />} />
            <Route path="/gmail" element={<PlatformInbox platform="gmail" />} />
            <Route path="/ai" element={<ComingSoon name="AI Assistant" />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/clients" element={<ComingSoon name="Clients" />} />
            <Route path="/settings" element={<ComingSoon name="Settings" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}