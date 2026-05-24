import React, { useEffect, useState } from 'react';
import { Search, Bell, SlidersHorizontal, Bot, Calendar, Check, User, Mail, MapPin, Sparkles, Clock } from 'lucide-react';
import { fetchStats, fetchLogs } from '../utils/api';

const platformColors = {
  instagram: { bg: '#fce7f3', text: '#9d174d', label: 'Instagram' },
  facebook: { bg: '#dbeafe', text: '#1e40af', label: 'Facebook' },
  gmail: { bg: '#ffedd5', text: '#9a3412', label: 'Gmail' },
  whatsapp: { bg: '#dcfce7', text: '#166534', label: 'WhatsApp' },
  unknown: { bg: '#f3f4f6', text: '#6b7280', label: 'Unknown' },
};

const urgencyColors = {
  high: { bg: '#fee2e2', text: '#991b1b', label: 'Urgent' },
  normal: { bg: '#f0fdf4', text: '#166534', label: 'Normal' },
  low: { bg: '#f3f4f6', text: '#6b7280', label: 'Low' },
};

function getInitials(str) {
  return str?.split(/[\s@]/)[0]?.slice(0, 2).toUpperCase() || 'UN';
}

function getUrgency(msg) {
  const lower = msg?.toLowerCase() || '';
  if (lower.includes('urgent') || lower.includes('disappointed') || lower.includes('unacceptable')) return 'high';
  if (lower.includes('schedule') || lower.includes('meeting')) return 'normal';
  return 'normal';
}

function getAvatarColor(str) {
  const colors = [
    'linear-gradient(135deg,#00c9a7,#0066ff)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#8b5cf6,#ec4899)',
    'linear-gradient(135deg,#06b6d4,#3b82f6)',
    'linear-gradient(135deg,#10b981,#06b6d4)',
  ];
  const idx = (str?.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
}

export default function Inbox({ filterPlatform = '' }) {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState(filterPlatform || 'all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations('', 100)
      .then(r => {
        const grouped = {};
        (r.data.conversations || []).forEach(msg => {
          const key = `${msg.platform}-${msg.user_id}`;
          if (!grouped[key]) grouped[key] = { ...msg, messages: [] };
          grouped[key].messages.push(msg);
        });
        const list = Object.values(grouped).sort((a, b) =>
          new Date(b.timestamp) - new Date(a.timestamp)
        );
        setConversations(list);
        if (list.length > 0) setSelected(list[0]);
      })
      .catch(() => setConversations([]))
      .finally(() => setLoading(false));
  }, []);

  const filters = ['all', 'whatsapp', 'instagram', 'facebook', 'gmail'];

  const filtered = conversations.filter(c => {
    const matchPlatform = filter === 'all' || c.platform === filter;
    const matchSearch = !search || c.user_id.toLowerCase().includes(search.toLowerCase()) || c.message?.toLowerCase().includes(search.toLowerCase());
    return matchPlatform && matchSearch;
  });

  const pc = platformColors[selected?.platform] || platformColors.unknown;
  const urgency = getUrgency(selected?.message);
  const uc = urgencyColors[urgency];

  return (
    <div className="flex h-full">
      {/* Conversation list */}
      <div className="w-72 flex flex-col border-r border-black/7 flex-shrink-0 bg-white">
        {/* Header */}
        <div className="px-4 py-3 border-b border-black/7 flex items-center gap-2">
          <h2 className="text-[15px] font-medium text-gray-900 flex-1">Inbox</h2>
          <div className="w-7 h-7 rounded-lg border border-black/8 flex items-center justify-center cursor-pointer hover:bg-gray-50">
            <Bell size={14} color="#6b7280" />
          </div>
          <div className="w-7 h-7 rounded-lg border border-black/8 flex items-center justify-center cursor-pointer hover:bg-gray-50">
            <SlidersHorizontal size={14} color="#6b7280" />
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-black/7">
          <div className="flex items-center gap-2 bg-gray-50 border border-black/8 rounded-lg px-3 py-1.5">
            <Search size={13} color="#9ca3af" />
            <input
              className="flex-1 text-[13px] bg-transparent outline-none text-gray-700 placeholder-gray-400"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="px-3 py-2 border-b border-black/7 flex gap-1.5 flex-wrap">
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-full text-[11px] border transition-all capitalize
                ${filter === f
                  ? 'gradient-bg text-white border-transparent'
                  : 'bg-white text-gray-500 border-black/10 hover:bg-gray-50'}`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-400">No conversations</div>
          ) : (
            filtered.map((c, i) => {
              const isSelected = selected?.user_id === c.user_id && selected?.platform === c.platform;
              const pColor = platformColors[c.platform] || platformColors.unknown;
              const urg = getUrgency(c.message);
              const uColor = urgencyColors[urg];
              return (
                <div
                  key={i}
                  onClick={() => setSelected(c)}
                  className={`px-3 py-3 cursor-pointer border-b border-black/5 flex gap-2.5 transition-all
                    ${isSelected ? 'bg-gradient-to-r from-teal-50 to-blue-50 border-l-2 border-l-teal-400' : 'hover:bg-gray-50'}`}
                >
                  {c.role === 'user' && <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0" style={{ background: 'linear-gradient(135deg,#00c9a7,#0066ff)' }} />}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium text-white flex-shrink-0"
                    style={{ background: getAvatarColor(c.user_id) }}
                  >
                    {getInitials(c.user_id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="text-[13px] font-medium text-gray-900 truncate">{c.user_id}</span>
                      <span className="text-[10px] text-gray-400 ml-auto flex-shrink-0">
                        {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-500 truncate mb-1">{c.message}</p>
                    <div className="flex gap-1">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: pColor.bg, color: pColor.text }}>{pColor.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: uColor.bg, color: uColor.text }}>{uColor.label}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat thread */}
      <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
        {selected ? (
          <>
            <div className="px-5 py-3 bg-white border-b border-black/7 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ background: getAvatarColor(selected.user_id) }}>
                {getInitials(selected.user_id)}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{selected.user_id}</p>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: pc.bg, color: pc.text }}>{pc.label}</span>
              </div>
              <div className="ml-auto flex gap-2">
                <button className="px-3 py-1.5 rounded-lg text-[12px] border border-black/10 bg-white hover:bg-gray-50 flex items-center gap-1.5">
                  <Check size={13} /> Resolve
                </button>
                <button className="px-3 py-1.5 rounded-lg text-[12px] text-white flex items-center gap-1.5 gradient-bg">
                  <Bot size={13} /> AI Reply
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {(selected.messages || [selected]).map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'assistant' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs px-3 py-2 rounded-xl text-[13px] ${
                    msg.role === 'assistant'
                      ? 'gradient-bg text-white rounded-br-sm'
                      : 'bg-white border border-black/8 text-gray-800 rounded-bl-sm'
                  }`}>
                    {msg.message}
                    <p className={`text-[10px] mt-1 ${msg.role === 'assistant' ? 'text-white/60' : 'text-gray-400'}`}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-4 py-3 bg-white border-t border-black/7 flex items-center gap-2">
              <input
                className="flex-1 text-[13px] bg-gray-50 border border-black/8 rounded-xl px-3 py-2 outline-none focus:border-teal-400"
                placeholder="Type a reply..."
              />
              <button className="gradient-bg text-white text-[12px] px-4 py-2 rounded-xl font-medium">Send</button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation to view
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="w-64 bg-white border-l border-black/7 flex flex-col overflow-y-auto flex-shrink-0">
        {selected && (
          <>
            {/* Client info */}
            <div className="p-4 border-b border-black/7">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <User size={11} /> Client info
              </p>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium" style={{ background: getAvatarColor(selected.user_id) }}>
                  {getInitials(selected.user_id)}
                </div>
                <div>
                  <p className="text-[13px] font-medium text-gray-900">{selected.user_id}</p>
                  <p className="text-[11px] text-gray-400">{platformColors[selected.platform]?.label}</p>
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-[12px] text-gray-500">
                  <Mail size={13} color="#9ca3af" />{selected.user_id}
                </div>
                <div className="flex items-center gap-2 text-[12px] text-gray-500">
                  <Clock size={13} color="#9ca3af" />
                  {new Date(selected.timestamp).toLocaleDateString()}
                </div>
              </div>
            </div>

            {/* AI suggestions */}
            <div className="p-4 border-b border-black/7">
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                <Sparkles size={11} /> AI suggestions
              </p>
              <div className="bg-gray-50 border border-black/8 rounded-lg p-2.5 mb-2 cursor-pointer hover:border-teal-400 transition-colors">
                <p className="text-[10px] font-medium gradient-text mb-1">Suggested reply</p>
                <p className="text-[12px] text-gray-700 leading-relaxed">Thank you for reaching out. The CEO would be happy to connect. Please share your preferred time.</p>
              </div>
              <div className="bg-gray-50 border border-black/8 rounded-lg p-2.5 cursor-pointer hover:border-teal-400 transition-colors">
                <p className="text-[10px] font-medium gradient-text mb-1">Intent detected</p>
                <p className="text-[12px] text-gray-700">Meeting request · Partnership</p>
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-[12px] mb-1">
                  <span className="text-gray-400">Urgency score</span>
                  <span className="text-teal-600 font-medium">High</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div className="h-1.5 gradient-bg rounded-full" style={{ width: '80%' }} />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 space-y-2">
              <button className="gradient-bg text-white text-[12px] px-3 py-2 rounded-lg w-full flex items-center gap-2 font-medium">
                <Bot size={14} /> Generate AI reply
              </button>
              <button className="border border-black/10 text-[12px] px-3 py-2 rounded-lg w-full flex items-center gap-2 text-gray-600 hover:bg-gray-50">
                <Calendar size={14} /> Schedule meeting
              </button>
              <button className="border border-black/10 text-[12px] px-3 py-2 rounded-lg w-full flex items-center gap-2 text-gray-600 hover:bg-gray-50">
                <Check size={14} /> Mark as resolved
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}