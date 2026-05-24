import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Inbox, MessageCircle, Instagram, Facebook,
  Mail, Brain, Calendar, BarChart2, Users, Settings,
  ChevronLeft, ChevronRight, Bot
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/', section: 'main' },
  { label: 'Unified Inbox', icon: Inbox, path: '/inbox', badge: 12, section: 'main' },
  { label: 'WhatsApp', icon: MessageCircle, path: '/whatsapp', badge: 4, section: 'platforms' },
  { label: 'Instagram', icon: Instagram, path: '/instagram', section: 'platforms' },
  { label: 'Facebook', icon: Facebook, path: '/facebook', badge: 3, section: 'platforms' },
  { label: 'Gmail', icon: Mail, path: '/gmail', badge: 5, section: 'platforms' },
  { label: 'AI Assistant', icon: Brain, path: '/ai', section: 'tools' },
  { label: 'Meetings', icon: Calendar, path: '/meetings', section: 'tools' },
  { label: 'Analytics', icon: BarChart2, path: '/analytics', section: 'tools' },
  { label: 'Clients', icon: Users, path: '/clients', section: 'tools' },
  { label: 'Settings', icon: Settings, path: '/settings', section: 'tools' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const sections = ['main', 'platforms', 'tools'];
  const sectionLabels = { main: 'Main', platforms: 'Platforms', tools: 'Tools' };

  return (
    <div className={`sidebar-bg flex flex-col h-full transition-all duration-200 ${collapsed ? 'w-14' : 'w-52'} flex-shrink-0`}>

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4 border-b border-white/10 mb-2">
        <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center flex-shrink-0">
          <Bot size={16} color="#fff" />
        </div>
        {!collapsed && <span className="text-white font-medium text-sm">Vertex AI</span>}
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
            {navItems.filter(i => i.section === section).map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
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
                    {!collapsed && item.badge && (
                      <span className="ml-auto gradient-bg text-white text-[10px] px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </div>

      {/* User + collapse */}
      <div
        className="flex items-center gap-2 px-3 py-3 border-t border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
          CM
        </div>
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">Cherry Mewie</p>
              <p className="text-white/40 text-[10px]">CEO Account</p>
            </div>
            <ChevronLeft size={14} color="rgba(255,255,255,0.3)" />
          </>
        )}
        {collapsed && <ChevronRight size={14} color="rgba(255,255,255,0.3)" />}
      </div>
    </div>
  );
}