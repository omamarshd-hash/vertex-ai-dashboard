import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Inbox from './pages/Inbox';
import Meetings from './pages/Meetings';
import Analytics from './pages/Analytics';
import AIAssistant from './pages/AIAssistant';
import Settings from './pages/Settings';
import Login from './pages/Login';
import './index.css';

function PlatformInbox({ platform }) {
  return <Inbox filterPlatform={platform} />;
}

function ComingSoon({ name }) {
  return (
    <div className="flex-1 flex items-center justify-center flex-col gap-3 text-gray-400 p-8">
      <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center">
        <span className="text-white text-2xl font-bold">{name[0]}</span>
      </div>
      <p className="text-lg font-medium text-gray-600">{name}</p>
      <p className="text-sm">Coming soon</p>
    </div>
  );
}

function ProtectedLayout({ user, onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:relative z-30 h-full transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar user={user} onLogout={onLogout} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-black/7">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-lg border border-black/10 flex items-center justify-center"
          >
            <span className="text-lg">☰</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-bg flex items-center justify-center">
              <span className="text-white text-xs font-bold">V</span>
            </div>
            <span className="font-medium text-sm text-gray-900">Vertex AI</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-gray-50">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/whatsapp" element={<PlatformInbox platform="whatsapp" />} />
            <Route path="/instagram" element={<PlatformInbox platform="instagram" />} />
            <Route path="/facebook" element={<PlatformInbox platform="facebook" />} />
            <Route path="/gmail" element={<PlatformInbox platform="gmail" />} />
            <Route path="/ai" element={<AIAssistant />} />
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/clients" element={<ComingSoon name="Clients" />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (stored && token) {
      setUser(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData) => setUser(userData);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(160deg, #0a1628, #0d2d3a, #0a2518)' }}>
        <div className="text-white text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {!user ? (
        <Routes>
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      ) : (
        <ProtectedLayout user={user} onLogout={handleLogout} />
      )}
    </BrowserRouter>
  );
}