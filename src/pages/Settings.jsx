import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, Globe, Bot, Save, Eye, EyeOff, Plus, Trash2, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';

const GOVERNOR_URL = process.env.REACT_APP_GOVERNOR_URL || 'https://governor-ai-1odr.onrender.com';

export default function Settings() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const [form, setForm] = useState({ name: user.name || '', business_name: user.business_name || '' });
  const [saved, setSaved] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [testAccounts, setTestAccounts] = useState([]);
  const [newTest, setNewTest] = useState({ platform: 'instagram', account_id: '', account_name: '' });
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: '', error: false });
  const [notifications, setNotifications] = useState(true);
  const [aiAutoReply, setAiAutoReply] = useState(true);

  useEffect(() => {
    // Load connected platforms
    axios.get(`${GOVERNOR_URL}/platforms/list`, { headers })
      .then(r => setPlatforms(r.data.platforms || []))
      .catch(() => {});

    // Load test accounts
    axios.get(`${GOVERNOR_URL}/test_accounts/list`, { headers })
      .then(r => setTestAccounts(r.data.test_accounts || []))
      .catch(() => {});

    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_success')) {
      // Reload platforms after OAuth
      setTimeout(() => {
        axios.get(`${GOVERNOR_URL}/platforms/list`, { headers })
          .then(r => setPlatforms(r.data.platforms || []))
          .catch(() => {});
      }, 1000);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleSave = async () => {
    try {
      const res = await axios.post(`${GOVERNOR_URL}/auth/me/update`, form, { headers });
      if (res.data.user) {
        localStorage.setItem('user', JSON.stringify({ ...user, ...res.data.user }));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  const handleChangePassword = async () => {
    if (!pwForm.current || !pwForm.newPw || !pwForm.confirm) { setPwMsg({ text: 'All fields required', error: true }); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ text: 'Passwords do not match', error: true }); return; }
    if (pwForm.newPw.length < 6) { setPwMsg({ text: 'Min 6 characters', error: true }); return; }
    setPwLoading(true);
    try {
      await axios.post(`${GOVERNOR_URL}/auth/change_password`, { current_password: pwForm.current, new_password: pwForm.newPw }, { headers });
      setPwMsg({ text: '✓ Password changed', error: false });
      setPwForm({ current: '', newPw: '', confirm: '' });
    } catch (e) {
      setPwMsg({ text: e.response?.data?.error || 'Failed', error: true });
    } finally { setPwLoading(false); }
  };

  const handleDisconnect = async (platform) => {
    try {
      await axios.post(`${GOVERNOR_URL}/platforms/disconnect`, { platform }, { headers });
      setPlatforms(platforms.map(p => p.platform === platform ? { ...p, status: 'disconnected' } : p));
    } catch {}
  };

  const handleAddTest = async () => {
    if (!newTest.account_id) return;
    try {
      await axios.post(`${GOVERNOR_URL}/test_accounts/add`, newTest, { headers });
      setTestAccounts([...testAccounts, { ...newTest, id: Date.now() }]);
      setNewTest({ platform: 'instagram', account_id: '', account_name: '' });
    } catch (e) { alert(e.response?.data?.error || 'Failed'); }
  };

  const handleRemoveTest = async (id) => {
    try {
      await axios.post(`${GOVERNOR_URL}/test_accounts/remove`, { id }, { headers });
      setTestAccounts(testAccounts.filter(t => t.id !== id));
    } catch {}
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
      <div><p className="text-sm text-gray-700">{label}</p>{sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}</div>
      <button onClick={() => onChange(!value)} className={`w-10 h-5 rounded-full transition-colors relative ${value ? 'bg-teal-400' : 'bg-gray-200'}`}>
        <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-transform ${value ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  );

  const PwInput = ({ label, field }) => (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      <div className="relative">
        <input type={showPw[field] ? 'text' : 'password'} value={pwForm[field]}
          onChange={e => { const v = e.target.value; setPwForm(prev => ({ ...prev, [field]: v })); }}
          autoComplete={field === 'current' ? 'current-password' : 'new-password'}
          autoCorrect="off" autoCapitalize="off" spellCheck="false"
          className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm outline-none focus:border-teal-400 pr-10"
          placeholder="••••••••" />
        <button type="button" onMouseDown={e => e.preventDefault()}
          onClick={() => setShowPw(prev => ({ ...prev, [field]: !prev[field] }))}
          className="absolute right-3 top-3 text-gray-400">
          {showPw[field] ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
    </div>
  );

  const platformIcons = { instagram: '📸', facebook: '💬', gmail: '✉️', whatsapp: '📱' };

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
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm outline-none focus:border-teal-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Email address</label>
            <input value={user.email} disabled className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm bg-gray-50 text-gray-400" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1 block">Business name</label>
            <input value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm outline-none focus:border-teal-400" />
          </div>
        </div>
        <button onClick={handleSave} className="gradient-bg text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 mt-4">
          <Save size={14} />{saved ? 'Saved!' : 'Save profile'}
        </button>
      </Section>

      <Section icon={Shield} title="Change password">
        <div className="space-y-3">
          <PwInput label="Current password" field="current" />
          <PwInput label="New password" field="newPw" />
          <PwInput label="Confirm new password" field="confirm" />
          {pwMsg.text && <p className={`text-xs ${pwMsg.error ? 'text-red-500' : 'text-teal-600'}`}>{pwMsg.text}</p>}
          <button onClick={handleChangePassword} disabled={pwLoading}
            className="gradient-bg text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
            {pwLoading ? 'Changing...' : 'Change password'}
          </button>
        </div>
      </Section>

      <Section icon={Globe} title="Connected platforms">
        {/* OAuth Connect Button */}
        <button onClick={async () => {
          try {
            const res = await axios.get(`${GOVERNOR_URL}/oauth/facebook/url`, { headers });
            window.location.href = res.data.url;
          } catch { alert('Failed to start connection'); }
        }}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#1877F2] text-white rounded-xl text-sm font-medium mb-4 hover:bg-[#166fe5] transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          Connect Facebook & Instagram
        </button>
        {platforms.length === 0 ? (
          <p className="text-sm text-gray-400">No platforms connected yet. Click above to connect.</p>
        ) : (
          platforms.map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-black/5 last:border-0">
              <div className="flex items-center gap-2">
                <span className="text-lg">{platformIcons[p.platform] || '🔗'}</span>
                <div>
                  <p className="text-sm font-medium text-gray-700 capitalize">{p.platform}</p>
                  <p className="text-xs text-gray-400">{p.account_name || p.account_id}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {p.status === 'active'
                  ? <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 font-medium flex items-center gap-1"><CheckCircle size={11} /> Connected</span>
                  : <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 font-medium flex items-center gap-1"><XCircle size={11} /> Disconnected</span>
                }
                {p.status === 'active' && p.platform !== 'gmail' && (
                  <button onClick={() => handleDisconnect(p.platform)} className="text-xs text-gray-400 hover:text-red-400">Disconnect</button>
                )}
              </div>
            </div>
          ))
        )}
      </Section>

      <Section icon={Shield} title="Test accounts">
        <p className="text-xs text-gray-400 mb-4">In Meta development mode, only these accounts can message your bot. Max 5 per platform.</p>
        <div className="space-y-2 mb-4">
          {testAccounts.map((ta, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-black/5">
              <div>
                <span className="text-xs font-medium text-gray-500 capitalize mr-2">{ta.platform}</span>
                <span className="text-sm text-gray-700">{ta.account_id}</span>
                {ta.account_name && <span className="text-xs text-gray-400 ml-2">({ta.account_name})</span>}
              </div>
              <button onClick={() => handleRemoveTest(ta.id)} className="text-gray-400 hover:text-red-400">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <select value={newTest.platform} onChange={e => setNewTest({ ...newTest, platform: e.target.value })}
            className="px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:border-teal-400 w-28">
            <option value="instagram">Instagram</option>
            <option value="facebook">Facebook</option>
            <option value="whatsapp">WhatsApp</option>
          </select>
          <input value={newTest.account_id} onChange={e => setNewTest({ ...newTest, account_id: e.target.value })}
            placeholder="Account ID" className="flex-1 px-3 py-2 rounded-lg border border-black/10 text-sm outline-none focus:border-teal-400" />
          <button onClick={handleAddTest} className="gradient-bg text-white px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1">
            <Plus size={14} /> Add
          </button>
        </div>
      </Section>

      <Section icon={Bot} title="AI Assistant">
        <Toggle label="Auto-reply with AI" sub="Let AI automatically reply to incoming messages" value={aiAutoReply} onChange={setAiAutoReply} />
        <Toggle label="Meeting detection" sub="Auto-detect and schedule meeting requests" value={true} onChange={() => {}} />
        <Toggle label="Smart suggestions" sub="Show AI reply suggestions in inbox" value={true} onChange={() => {}} />
      </Section>

      <Section icon={Bell} title="Notifications">
        <Toggle label="New message alerts" sub="Get notified when new messages arrive" value={notifications} onChange={setNotifications} />
        <Toggle label="Meeting reminders" sub="Alerts before scheduled meetings" value={true} onChange={() => {}} />
      </Section>
    </div>
  );
}