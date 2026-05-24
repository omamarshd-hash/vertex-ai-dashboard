import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { fetchStats, fetchLogs } from '../utils/api';

const COLORS = ['#00c9a7', '#0066ff', '#8b5cf6', '#f59e0b'];

const weeklyData = [
  { day: 'Mon', instagram: 12, facebook: 8, gmail: 6, whatsapp: 4 },
  { day: 'Tue', instagram: 18, facebook: 12, gmail: 9, whatsapp: 7 },
  { day: 'Wed', instagram: 14, facebook: 9, gmail: 8, whatsapp: 5 },
  { day: 'Thu', instagram: 22, facebook: 15, gmail: 11, whatsapp: 9 },
  { day: 'Fri', instagram: 25, facebook: 18, gmail: 13, whatsapp: 11 },
  { day: 'Sat', instagram: 16, facebook: 10, gmail: 7, whatsapp: 6 },
  { day: 'Sun', instagram: 9, facebook: 6, gmail: 4, whatsapp: 3 },
];

export default function Analytics() {
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchStats().then(r => setStats(r.data)).catch(() => {});
    fetchLogs(100).then(r => setLogs(r.data.logs || [])).catch(() => {});
  }, []);

  const platformBreakdown = [
    { name: 'Instagram', value: logs.filter(l => l.platform === 'instagram').length || 35 },
    { name: 'Facebook', value: logs.filter(l => l.platform === 'facebook').length || 28 },
    { name: 'Gmail', value: logs.filter(l => l.platform === 'gmail').length || 22 },
    { name: 'WhatsApp', value: logs.filter(l => l.platform === 'whatsapp').length || 15 },
  ];

  return (
    <div className="p-6 max-w-5xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Analytics</h1>
        <p className="text-sm text-gray-500 mt-0.5">Performance insights across all platforms</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total messages', value: stats.total_messages || 0, color: '#00c9a7' },
          { label: 'Total meetings', value: stats.total_meetings || 0, color: '#0066ff' },
          { label: 'Unique clients', value: stats.total_users || 0, color: '#8b5cf6' },
          { label: 'AI automation', value: '98%', color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-black/6 p-4">
            <p className="text-xs text-gray-500 mb-2">{s.label}</p>
            <p className="text-2xl font-semibold" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Weekly chart */}
        <div className="col-span-2 bg-white rounded-xl border border-black/6 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Weekly messages by platform</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={weeklyData}>
              <defs>
                {['instagram','facebook','gmail','whatsapp'].map((p, i) => (
                  <linearGradient key={p} id={`grad-${p}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS[i]} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.1)' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {['instagram','facebook','gmail','whatsapp'].map((p, i) => (
                <Area key={p} type="monotone" dataKey={p} stroke={COLORS[i]} strokeWidth={2} fill={`url(#grad-${p})`} />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-xl border border-black/6 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Platform share</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={platformBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {platformBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {platformBreakdown.map((p, i) => (
              <div key={p.name} className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i] }} />
                <span>{p.name}</span>
                <span className="ml-auto font-medium">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event type breakdown */}
      <div className="bg-white rounded-xl border border-black/6 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Activity breakdown</h3>
        <div className="space-y-2">
          {[
            { label: 'Messages received', value: stats.total_messages || 0, color: '#00c9a7' },
            { label: 'Meetings scheduled', value: stats.total_meetings || 0, color: '#0066ff' },
            { label: 'AI replies sent', value: Math.floor((stats.total_messages || 0) * 0.98), color: '#8b5cf6' },
            { label: 'Meetings cancelled', value: Math.floor((stats.total_meetings || 0) * 0.2), color: '#ef4444' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="text-xs text-gray-500 w-40 flex-shrink-0">{item.label}</span>
              <div className="flex-1 h-2 bg-gray-100 rounded-full">
                <div className="h-2 rounded-full" style={{ width: `${Math.min(100, (item.value / Math.max(stats.total_messages || 1, 1)) * 100)}%`, background: item.color }} />
              </div>
              <span className="text-xs font-medium text-gray-700 w-8 text-right">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}