import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bot, Building2, Shield, Instagram, Facebook, MessageCircle, Mail, Check, ArrowRight, ArrowLeft, ExternalLink, Plus, Trash2, AlertCircle } from 'lucide-react';

const GOVERNOR_URL = process.env.REACT_APP_GOVERNOR_URL || 'https://governor-ai-1odr.onrender.com';

const STEPS = [
  { id: 1, title: 'Business Profile',     icon: Building2,     desc: 'Tell us about your business' },
  { id: 2, title: 'Meta Verification',    icon: Shield,        desc: 'Verify with Meta' },
  { id: 3, title: 'Connect Instagram',    icon: Instagram,     desc: 'Link Instagram account' },
  { id: 4, title: 'Connect Facebook',     icon: Facebook,      desc: 'Link Facebook page' },
  { id: 5, title: 'Connect WhatsApp',     icon: MessageCircle, desc: 'Link WhatsApp Business' },
  { id: 6, title: 'Connect Gmail',        icon: Mail,          desc: 'Link Gmail account' },
  { id: 7, title: 'Test Accounts',        icon: Shield,        desc: 'Add test accounts' },
];

const INDUSTRIES = ['Technology','E-Commerce','Healthcare','Education','Finance','Real Estate','Marketing','Consulting','Manufacturing','Other'];


function OAuthConnectButton({ platform, token, headers }) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${GOVERNOR_URL}/oauth/facebook/url`, { headers });
      window.location.href = res.data.url;
    } catch (e) {
      alert('Failed to start OAuth. Please try manual entry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleConnect} disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-[#1877F2] text-white rounded-xl text-sm font-medium hover:bg-[#166fe5] transition-colors disabled:opacity-50">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
      {loading ? 'Connecting...' : `Connect with Facebook`}
    </button>
  );
}

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('oauth_success')) {
      setStep(s => s); // stay on current step, platforms auto-connected
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  // Step 1
  const [business, setBusiness] = useState({ business_name: user?.business_name || '', industry: '', website: '' });

  // Step 2
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);

  // Step 3
  const [instagram, setInstagram] = useState({ account_id: '', page_id: '', access_token: '', account_name: '', skip: false });

  // Step 4
  const [facebook, setFacebook] = useState({ page_id: '', access_token: '', account_name: '', skip: false });

  // Step 5
  const [whatsapp, setWhatsapp] = useState({ phone_number_id: '', access_token: '', account_name: '', skip: false });

  // Step 6 — Gmail auto-connected
  const [gmail] = useState({ email: user?.email || '' });

  // Step 7
  const [testAccounts, setTestAccounts] = useState([{ platform: 'instagram', account_id: '', account_name: '' }]);

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const handleNext = async () => {
    setError('');
    setLoading(true);
    try {
      if (step === 1) {
        if (!business.business_name) { setError('Business name is required'); setLoading(false); return; }
        await axios.post(`${GOVERNOR_URL}/onboarding/complete`, business, { headers });

      } else if (step === 2) {
        if (verificationSubmitted) {
          await axios.post(`${GOVERNOR_URL}/meta/verification/submit`, {}, { headers });
        }
        // Step 2 can be skipped — just move forward

      } else if (step === 3 && !instagram.skip) {
        if (instagram.account_id && instagram.access_token) {
          await axios.post(`${GOVERNOR_URL}/platforms/connect`, {
            platform: 'instagram',
            account_id: instagram.account_id,
            page_id: instagram.page_id,
            access_token: instagram.access_token,
            account_name: instagram.account_name || 'Instagram Account',
          }, { headers });
        }

      } else if (step === 4 && !facebook.skip) {
        if (facebook.page_id && facebook.access_token) {
          await axios.post(`${GOVERNOR_URL}/platforms/connect`, {
            platform: 'facebook',
            account_id: facebook.page_id,
            page_id: facebook.page_id,
            access_token: facebook.access_token,
            account_name: facebook.account_name || 'Facebook Page',
          }, { headers });
        }

      } else if (step === 5 && !whatsapp.skip) {
        if (whatsapp.phone_number_id && whatsapp.access_token) {
          await axios.post(`${GOVERNOR_URL}/platforms/connect`, {
            platform: 'whatsapp',
            account_id: whatsapp.phone_number_id,
            phone_number_id: whatsapp.phone_number_id,
            access_token: whatsapp.access_token,
            account_name: whatsapp.account_name || 'WhatsApp Business',
          }, { headers });
        }

      } else if (step === 6) {
        await axios.post(`${GOVERNOR_URL}/platforms/connect`, {
          platform: 'gmail',
          account_id: gmail.email,
          account_name: gmail.email,
          status: 'active'
        }, { headers });

      } else if (step === 7) {
        for (const ta of testAccounts) {
          if (ta.account_id) {
            await axios.post(`${GOVERNOR_URL}/test_accounts/add`, ta, { headers });
          }
        }
        await axios.post(`${GOVERNOR_URL}/onboarding/complete`, { ...business, onboarding_complete: true }, { headers });
        const stored = JSON.parse(localStorage.getItem('user') || '{}');
        stored.onboarding_complete = true;
        localStorage.setItem('user', JSON.stringify(stored));
        onComplete();
        return;
      }

      setStep(s => s + 1);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const Input = ({ label, value, onChange, placeholder, type = 'text', hint }) => (
    <div>
      <label className="text-xs font-medium text-gray-500 mb-1 block">{label}</label>
      <input value={value} onChange={e => onChange(e.target.value)} type={type}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 transition-colors"
        placeholder={placeholder} />
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );

  return (
    <div style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0d2d3a 50%, #0a2518 100%)', minHeight: '100vh' }}
      className="flex">

      {/* Sidebar */}
      <div className="hidden lg:flex flex-col w-72 p-8 border-r border-white/10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Bot size={20} color="#fff" />
          </div>
          <span className="text-white font-semibold text-lg">Vertex AI</span>
        </div>
        <div className="space-y-1">
          {STEPS.map(s => (
            <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${s.id === step ? 'bg-white/10' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                s.id < step ? 'gradient-bg border-transparent' :
                s.id === step ? 'border-teal-400' : 'border-white/20'}`}>
                {s.id < step
                  ? <Check size={14} color="#fff" />
                  : <s.icon size={14} color={s.id === step ? '#00c9a7' : 'rgba(255,255,255,0.3)'} />}
              </div>
              <div>
                <p className={`text-sm font-medium ${s.id <= step ? 'text-white' : 'text-white/40'}`}>{s.title}</p>
                <p className="text-xs text-white/30">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto">
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-1 gradient-bg rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-white/40 text-xs mt-2">Step {step} of {STEPS.length}</p>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">

          {/* Mobile progress */}
          <div className="lg:hidden flex gap-1 mb-6">
            {STEPS.map(s => (
              <div key={s.id} className={`h-1 flex-1 rounded-full ${s.id <= step ? 'gradient-bg' : 'bg-white/20'}`} />
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">

            {/* Step 1 — Business Profile */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-2">
                  <Building2 size={22} color="#fff" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Business Profile</h2>
                  <p className="text-sm text-gray-400 mt-1">Tell us about your business so AI can represent you accurately.</p>
                </div>
                <Input label="Business name *" value={business.business_name} onChange={v => setBusiness({...business, business_name: v})} placeholder="Vertex AI Solutions" />
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Industry</label>
                  <select value={business.industry} onChange={e => setBusiness({...business, industry: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400">
                    <option value="">Select industry</option>
                    {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
                  </select>
                </div>
                <Input label="Website (optional)" value={business.website} onChange={v => setBusiness({...business, website: v})} placeholder="https://yourwebsite.com" />
              </div>
            )}

            {/* Step 2 — Meta Verification */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-2">
                  <Shield size={22} color="#fff" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Meta Business Verification</h2>
                  <p className="text-sm text-gray-400 mt-1">Verify your business with Meta to go live. This takes 24–48 hours.</p>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-sm font-medium text-blue-800 mb-3">📋 Follow these steps:</p>
                  <div className="space-y-2">
                    {[
                      'Go to Meta Business Manager',
                      'Navigate to Settings → Business Verification',
                      'Submit your business registration documents',
                      'Verify your business phone number',
                      'Wait 24–48 hours for Meta to review',
                      'Come back here to confirm verification',
                    ].map((step, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full gradient-bg flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-xs font-bold">{i + 1}</span>
                        </div>
                        <p className="text-sm text-blue-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <a href="https://business.facebook.com/settings/security" target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 gradient-bg text-white rounded-xl text-sm font-medium">
                  <ExternalLink size={16} />
                  Open Meta Business Manager
                </a>

                <div className="border border-gray-200 rounded-xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={verificationSubmitted}
                      onChange={e => setVerificationSubmitted(e.target.checked)}
                      className="w-4 h-4 accent-teal-500" />
                    <span className="text-sm text-gray-700">I've submitted my verification to Meta</span>
                  </label>
                  {verificationSubmitted && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-green-700">✅ Great! We'll activate your bot in test mode while you wait. Once Meta verifies your business, all users can message you.</p>
                    </div>
                  )}
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-yellow-700">Until verified, only test accounts you add can message your bot. You can skip this step and come back later.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Instagram */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-2">
                  <Instagram size={22} color="#fff" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Connect Instagram</h2>
                  <p className="text-sm text-gray-400 mt-1">Link your Instagram Business account to handle DMs automatically.</p>
                </div>
                <OAuthConnectButton platform="instagram" token={token} headers={headers} />
                <p className="text-xs text-gray-400 text-center">or enter manually:</p>
                {!instagram.skip ? (
                  <div className="space-y-4">
                    <Input label="Instagram Account ID" value={instagram.account_id} onChange={v => setInstagram({...instagram, account_id: v})} placeholder="17841478520495248" hint="Found in Meta Business Suite → Instagram Account" />
                    <Input label="Facebook Page ID" value={instagram.page_id} onChange={v => setInstagram({...instagram, page_id: v})} placeholder="1003745256147352" hint="The Facebook Page linked to your Instagram" />
                    <Input label="Page Access Token" value={instagram.access_token} onChange={v => setInstagram({...instagram, access_token: v})} placeholder="EAAxxxxxxx..." type="password" hint="From Meta Developer Portal → Your App → Tokens" />
                    <button onClick={() => setInstagram({...instagram, skip: true})} className="text-sm text-gray-400 underline">Skip for now</button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">Skipped — connect later from Settings.</p>
                    <button onClick={() => setInstagram({...instagram, skip: false})} className="text-sm text-yellow-600 underline mt-2 block">Connect now</button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 — Facebook */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-2">
                  <Facebook size={22} color="#fff" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Connect Facebook</h2>
                  <p className="text-sm text-gray-400 mt-1">Link your Facebook Page to handle Messenger messages automatically.</p>
                </div>
                <OAuthConnectButton platform="facebook" token={token} headers={headers} />
                <p className="text-xs text-gray-400 text-center">or enter manually:</p>
                {!facebook.skip ? (
                  <div className="space-y-4">
                    <Input label="Facebook Page ID" value={facebook.page_id} onChange={v => setFacebook({...facebook, page_id: v})} placeholder="1003745256147352" />
                    <Input label="Page Name (optional)" value={facebook.account_name} onChange={v => setFacebook({...facebook, account_name: v})} placeholder="Your Business Page" />
                    <Input label="Page Access Token" value={facebook.access_token} onChange={v => setFacebook({...facebook, access_token: v})} placeholder="EAAxxxxxxx..." type="password" />
                    <button onClick={() => setFacebook({...facebook, skip: true})} className="text-sm text-gray-400 underline">Skip for now</button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">Skipped — connect later from Settings.</p>
                    <button onClick={() => setFacebook({...facebook, skip: false})} className="text-sm text-yellow-600 underline mt-2 block">Connect now</button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5 — WhatsApp */}
            {step === 5 && (
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-2">
                  <MessageCircle size={22} color="#fff" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Connect WhatsApp</h2>
                  <p className="text-sm text-gray-400 mt-1">Link your WhatsApp Business number for AI-powered messaging.</p>
                </div>
                {!whatsapp.skip ? (
                  <div className="space-y-4">
                    <Input label="Phone Number ID" value={whatsapp.phone_number_id} onChange={v => setWhatsapp({...whatsapp, phone_number_id: v})} placeholder="123456789012345" hint="From Meta Developer Portal → WhatsApp → Phone Numbers" />
                    <Input label="Display Name (optional)" value={whatsapp.account_name} onChange={v => setWhatsapp({...whatsapp, account_name: v})} placeholder="Your Business Name" />
                    <Input label="Access Token" value={whatsapp.access_token} onChange={v => setWhatsapp({...whatsapp, access_token: v})} placeholder="EAAxxxxxxx..." type="password" />
                    <button onClick={() => setWhatsapp({...whatsapp, skip: true})} className="text-sm text-gray-400 underline">Skip for now</button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">Skipped — connect later from Settings.</p>
                    <button onClick={() => setWhatsapp({...whatsapp, skip: false})} className="text-sm text-yellow-600 underline mt-2 block">Connect now</button>
                  </div>
                )}
              </div>
            )}

            {/* Step 6 — Gmail */}
            {step === 6 && (
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-2">
                  <Mail size={22} color="#fff" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Connect Gmail</h2>
                  <p className="text-sm text-gray-400 mt-1">Your Gmail is automatically connected using your signup email.</p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center">
                    <Check size={18} color="#16a34a" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Auto-connected</p>
                    <p className="text-xs text-green-600">{gmail.email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400">The AI will monitor this inbox and reply to real human emails on your behalf. Automated emails like notifications and newsletters are automatically filtered out.</p>
              </div>
            )}

            {/* Step 7 — Test Accounts */}
            {step === 7 && (
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-2">
                  <Shield size={22} color="#fff" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Test Accounts</h2>
                  <p className="text-sm text-gray-400 mt-1">Add accounts that can test your bot while in Meta development mode. Max 5 per platform.</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                  <p className="text-xs text-blue-700">These accounts can message your bot before Meta verification is complete. Add your own test accounts or your team members.</p>
                </div>
                <div className="space-y-2">
                  {testAccounts.map((ta, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select value={ta.platform} onChange={e => { const u = [...testAccounts]; u[i].platform = e.target.value; setTestAccounts(u); }}
                        className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 w-32">
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                      <input value={ta.account_id} onChange={e => { const u = [...testAccounts]; u[i].account_id = e.target.value; setTestAccounts(u); }}
                        className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                        placeholder="Account ID" />
                      <button onClick={() => setTestAccounts(testAccounts.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {testAccounts.length < 5 && (
                    <button onClick={() => setTestAccounts([...testAccounts, { platform: 'instagram', account_id: '', account_name: '' }])}
                      className="flex items-center gap-2 text-sm text-teal-600 font-medium mt-1">
                      <Plus size={15} /> Add test account
                    </button>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                <AlertCircle size={15} />{error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {step > 1
                ? <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                    <ArrowLeft size={16} /> Back
                  </button>
                : <div />
              }
              <button onClick={handleNext} disabled={loading}
                className="flex items-center gap-2 text-white text-sm font-medium px-6 py-3 rounded-xl gradient-bg disabled:opacity-50">
                {loading ? 'Saving...' : step === 7 ? '🚀 Complete Setup' : 'Continue'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>

            <p className="text-center text-xs text-gray-400 mt-4">
              <button onClick={() => onComplete()} className="underline hover:text-gray-600">Skip setup and go to dashboard</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}