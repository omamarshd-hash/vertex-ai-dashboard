import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Video, CheckCircle, XCircle, Plus } from 'lucide-react';
import { fetchStats, fetchLogs } from '../utils/api';

const statusColors = {
  scheduled: { bg: '#dcfce7', text: '#166534', label: 'Scheduled', icon: CheckCircle },
  cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'Cancelled', icon: XCircle },
};

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings()
      .then(r => setMeetings(r.data.meetings || []))
      .catch(() => setMeetings([]))
      .finally(() => setLoading(false));
  }, []);

  const upcoming = meetings.filter(m => m.status === 'scheduled');
  const past = meetings.filter(m => m.status === 'cancelled');

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Meetings</h1>
          <p className="text-sm text-gray-500 mt-0.5">All scheduled and cancelled meetings</p>
        </div>
        <button className="gradient-bg text-white text-sm px-4 py-2 rounded-lg flex items-center gap-2 font-medium">
          <Plus size={15} /> Schedule meeting
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-black/6 p-4">
          <p className="text-xs text-gray-500 mb-1">Total meetings</p>
          <p className="text-2xl font-semibold text-gray-900">{meetings.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-black/6 p-4">
          <p className="text-xs text-gray-500 mb-1">Upcoming</p>
          <p className="text-2xl font-semibold" style={{ color: '#00c9a7' }}>{upcoming.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-black/6 p-4">
          <p className="text-xs text-gray-500 mb-1">Cancelled</p>
          <p className="text-2xl font-semibold text-red-500">{past.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading meetings...</div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Calendar size={40} className="mx-auto mb-3 opacity-30" />
          <p>No meetings scheduled yet</p>
          <p className="text-xs mt-1">Meetings scheduled via Instagram, Facebook, or Gmail will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings.map((m, i) => {
            const sc = statusColors[m.status] || statusColors.scheduled;
            const StatusIcon = sc.icon;
            return (
              <div key={i} className="bg-white rounded-xl border border-black/6 p-4 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center flex-shrink-0">
                  <Calendar size={18} color="#fff" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900">{m.title}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: sc.bg, color: sc.text }}>
                      {sc.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar size={11} />{m.meeting_date}</span>
                    <span className="flex items-center gap-1"><Clock size={11} />{m.meeting_time}</span>
                    <span className="flex items-center gap-1 capitalize"><StatusIcon size={11} />{m.platform}</span>
                  </div>
                  {m.description && <p className="text-xs text-gray-400 mt-1">{m.description}</p>}
                </div>
                {m.google_meet_link && (
                  <a
                    href={m.google_meet_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[12px] gradient-bg text-white px-3 py-1.5 rounded-lg flex-shrink-0 no-underline"
                  >
                    <Video size={13} /> Join
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}