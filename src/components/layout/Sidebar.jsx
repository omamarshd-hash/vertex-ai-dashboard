import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Inbox, MessageCircle, Instagram, Facebook,
  Mail, Brain, Calendar, BarChart2, Users, Settings,
  ChevronLeft, ChevronRight, Bot, LogOut, X
} from 'lucide-react';
import { fetchStats } from '../../utils/api';

const navBase = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', section: 'main' },
  { label: 'Unified Inbox', icon: Inbox, path: '/inbox', section: 'main', key: 'total' },
  { label: 'WhatsApp', icon: MessageCircle, path: '/whatsapp', section: 'platforms', key: 'whatsapp' },
  { label: 'Instagram', icon: Instagram, path: '/instagram', section: 'platforms', key: 'instagram' },
  { label: 'Facebook', icon: Facebook, path: '/facebook', section: 'platforms', key: 'facebook' },
  { label: 'Gmail', icon: Mail, path: '/gmail', section: 'platforms', key: 'gmail' },
  { label: 'AI Assistant', icon: Brain, path: '/ai', section: 'tools' },
  { label: 'Meetings', icon: Calendar, path: '/meetings', section: 'tools' },
  { label: 'Analytics', icon: BarChart2, path: '/analytics', section: 'tools' },
  { label: 'Clients', icon: Users, path: '/clients', section: 'tools' },
  { label: 'Settings', icon: Settings, path: '/settings', section: 'tools' },
];

export default function Sidebar({ user, onLogout, onClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const [counts, setCounts] = useState({});

  useEffect(() => {
    fetchStats()
      .then(r => {
        const s = r.data;
        setCounts({
          total: s.total_messages || 0,
          whatsapp: s.whatsapp_messages || 0,
          instagram: s.instagram_messages || 0,
          facebook: s.facebook_messages || 0,
          gmail: s.gmail_messages || 0,
        });
      })
      .catch(() => {});
  }, []);

  const sections = ['main', 'platforms', 'tools'];
  const sectionLabels = { main: 'Main', platforms: 'Platforms', tools: 'Tools' };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U';

  return (
    <div className={`sidebar-bg flex flex-col h-full transition-all duration-200 ${collapsed ? 'w-14' : 'w-52'} flex-shrink-0`}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10 mb-2">
        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
          <Bot size={16} color="#fff" />
        </div>
        {!collapsed && <span className="text-white font-medium text-sm flex-1">Vertex AI</span>}
        {onClose && !collapsed && (
          <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-2 py-1">
        {sections.map(section => (
          <div key={section}>
            {!collapsed && (
              <p className="text-[10px] text-white/30 uppercase tracking-widest px-2 pt-3 pb-1">
                {sectionLabels[section]}
              </p>
            )}
            {navBase.filter(i => i.section === section).map(item => {
              const badge = item.key ? counts[item.key] : null;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 transition-all duration-150 no-underline
                    ${isActive
                      ? 'bg-gradient-to-r from-teal-500/20 to-blue-500/15 border border-teal-400/25'
                      : 'hover:bg-white/7'}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon size={17} color={isActive ? '#00c9a7' : 'rgba(255,255,255,0.45)'} className="flex-shrink-0" />
                      {!collapsed && (
                        <span className={`text-[13px] whitespace-nowrap ${isActive ? 'text-white font-medium' : 'text-white/60'}`}>
                          {item.label}
                        </span>
                      )}
                      {!collapsed && badge > 0 && (
                        <span className="ml-auto gradient-bg text-white text-[10px] px-1.5 py-0.5 rounded-full">
                          {badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </div>

      {/* User info + logout — always visible */}
      <div className="border-t border-white/10 p-2">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg mb-1">
          <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name || 'CEO'}</p>
              <p className="text-white/40 text-[10px] truncate">{user?.email || ''}</p>
            </div>
          )}
          <button
            onClick={onLogout}
            className="text-white/30 hover:text-red-400 transition-colors flex-shrink-0"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex items-center gap-2 px-2 py-1.5 w-full rounded-lg hover:bg-white/5 transition-colors"
        >
          {collapsed
            ? <ChevronRight size={14} color="rgba(255,255,255,0.3)" />
            : <><ChevronLeft size={14} color="rgba(255,255,255,0.3)" /><span className="text-[10px] text-white/30">Collapse</span></>
          }
        </button>
      </div>
    </div>
  );
}