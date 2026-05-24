import React, { useEffect, useState } from 'react';
import { MessageSquare, Calendar, Users, Zap, TrendingUp, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { fetchStats, fetchLogs } from '../utils/api';

const activityData = [
  { day: 'Mon', messages: 24, meetings: 3 },
  { day: 'Tue', messages: 38, meetings: 5 },
  { day: 'Wed', messages: 29, meetings: 2 },
  { day: 'Thu', messages: 47, meetings: 7 },
  { day: 'Fri', messages: 52, meetings: 4 },
  { day: 'Sat', messages: 31, meetings: 6 },
  { day: 'Sun', messages: 18, meetings: 1 },
];

const platformData = [
  { name: 'Instagram', value: 35 },
  { name: 'Facebook', value: 28 },
  { name: 'Gmail', value: 22 },
  { name: 'WhatsApp', value: 15 },
];

function StatCard({ icon: Icon, label, value, sub, color }) {
  return (
    <div className="bg-white rounded-xl border border-black/6 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center`} style={{ background: color + '18' }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState({ total_messages: 0, total_meetings: 0, total_users: 0, upcoming_meetings: 0 });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchStats(), fetchLogs(10)])
      .then(([s, l]) => {
        setStats(s.data);
        setLogs(l.data.logs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: MessageSquare, label: 'Total messages', value: loading ? '...' : stats.total_messages, sub: 'All platforms combined', color: '#00c9a7' },
    { icon: Calendar, label: 'Scheduled meetings', value: loading ? '...' : stats.upcoming_meetings, sub: 'Upcoming this month', color: '#0066ff' },
    { icon: Users, label: 'Active clients', value: loading ? '...' : stats.total_users, sub: 'Unique users messaging', color: '#8b5cf6' },
    { icon: Zap, label: 'AI automation rate', value: '98%', sub: 'Replies handled by AI', color: '#f59e0b' },
  ];

  return (
    <div className="p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your AI communication system</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statCards.map(c => <StatCard key={c.label} {...c} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="col-span-2 bg-white rounded-xl border border-black/6 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Message activity this week</h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={activityData}>
              <defs>
                <linearGradient id="msgGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c9a7" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#00c9a7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '0.5px solid rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="messages" stroke="#00c9a7" strokeWidth={2} fill="url(#msgGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-black/6 p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Platform breakdown</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={platformData} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={70} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Bar dataKey="value" fill="#0066ff" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white rounded-xl border border-black/6 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Recent activity</h3>
        {logs.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No activity yet</p>
        ) : (
          <div className="space-y-2">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-black/4 last:border-0">
                <div className="w-7 h-7 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                  <Clock size={13} color="#fff" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 truncate">{log.details}</p>
                  <p className="text-[10px] text-gray-400">{log.platform} · {log.event_type}</p>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}