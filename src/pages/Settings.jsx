import React, { useState } from 'react';
import { User, Bell, Shield, Globe, Bot, Save } from 'lucide-react';

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    business_name: user.business_name || '',
    notifications: true,
    ai_auto_reply: true,
    meeting_alerts: true,
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="bg-white rounded-xl border border-black/6 p-5 mb-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
          <Icon size={14} color="#fff" />
        </div>
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ label, sub, value, onChange }) => (
    <div className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-colors relative ${value ? 'bg-teal-400' : 'bg-gray-200'}`}
      >
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account and preferences</p>
      </div>

      <Section icon={User} title="Profile">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Full name</label>
            <input
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm outline-none focus:border-teal-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email address</label>
            <input
              value={form.email}
              disabled
              className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm bg-gray-50 text-gray-400"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Business name</label>
            <input
              value={form.business_name}
              onChange={e => setForm({ ...form, business_name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm outline-none focus:border-teal-400"
            />
          </div>
        </div>
      </Section>

      <Section icon={Bot} title="AI Assistant">
        <Toggle
          label="Auto-reply with AI"
          sub="Let AI automatically reply to incoming messages"
          value={form.ai_auto_reply}
          onChange={v => setForm({ ...form, ai_auto_reply: v })}
        />
        <Toggle
          label="Meeting detection"
          sub="Automatically detect and schedule meeting requests"
          value={true}
          onChange={() => {}}
        />
        <Toggle
          label="Smart suggestions"
          sub="Show AI reply suggestions in inbox"
          value={true}
          onChange={() => {}}
        />
      </Section>

      <Section icon={Bell} title="Notifications">
        <Toggle
          label="New message alerts"
          sub="Get notified when new messages arrive"
          value={form.notifications}
          onChange={v => setForm({ ...form, notifications: v })}
        />
        <Toggle
          label="Meeting reminders"
          sub="Alerts before scheduled meetings"
          value={form.meeting_alerts}
          onChange={v => setForm({ ...form, meeting_alerts: v })}
        />
      </Section>

      <Section icon={Globe} title="Connected platforms">
        {['Instagram', 'Facebook Messenger', 'Gmail', 'WhatsApp'].map((p, i) => (
          <div key={p} className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
            <span className="text-sm text-gray-700">{p}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
              i < 3 ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
            }`}>
              {i < 3 ? 'Connected' : 'Pending'}
            </span>
          </div>
        ))}
      </Section>

      <button
        onClick={handleSave}
        className="gradient-bg text-white px-6 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2"
      >
        <Save size={15} />
        {saved ? 'Saved!' : 'Save changes'}
      </button>
    </div>
  );
}