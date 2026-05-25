import React, { useState } from 'react';
import { Bot, Building, Instagram, Facebook, Mail, MessageCircle, Check, ArrowRight, ArrowLeft, Shield, Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const GOVERNOR_URL = process.env.REACT_APP_GOVERNOR_URL || 'https://governor-ai-1odr.onrender.com';

const INDUSTRIES = [
  'Technology', 'E-Commerce', 'Healthcare', 'Education', 'Finance',
  'Real Estate', 'Marketing', 'Consulting', 'Manufacturing', 'Other'
];

const steps = [
  { id: 1, title: 'Business Profile', icon: Building, desc: 'Tell us about your business' },
  { id: 2, title: 'Connect Gmail', icon: Mail, desc: 'Set up email handling' },
  { id: 3, title: 'Connect Instagram', icon: Instagram, desc: 'Link your Instagram account' },
  { id: 4, title: 'Connect Facebook', icon: Facebook, desc: 'Link your Facebook page' },
  { id: 5, title: 'WhatsApp', icon: MessageCircle, desc: 'Connect WhatsApp Business' },
  { id: 6, title: 'Test Accounts', icon: Shield, desc: 'Add test accounts for dev mode' },
];

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [business, setBusiness] = useState({
    business_name: user?.business_name || '',
    industry: '',
    website: '',
  });

  const [gmail, setGmail] = useState({
    email: user?.email || '',
    connected: true, // Gmail is auto-connected via the same email
  });

  const [instagram, setInstagram] = useState({
    account_id: '',
    page_id: '',
    access_token: '',
    account_name: '',
    skip: false,
  });

  const [facebook, setFacebook] = useState({
    page_id: '',
    access_token: '',
    account_name: '',
    skip: false,
  });

  const [whatsapp, setWhatsapp] = useState({
    phone_number_id: '',
    access_token: '',
    account_name: '',
    skip: false,
  });

  const [testAccounts, setTestAccounts] = useState([
    { platform: 'instagram', account_id: '', account_name: '' }
  ]);

  const token = localStorage.getItem('token');
  const headers = { Authorization: `Bearer ${token}` };

  const connectPlatform = async (platform, data) => {
    try {
      await axios.post(`${GOVERNOR_URL}/platforms/connect`, { platform, ...data }, { headers });
    } catch (e) {
      console.log('Platform connect error:', e);
    }
  };

  const handleNext = async () => {
    setError('');
    setLoading(true);

    try {
      if (step === 1) {
        // Save business profile
        await axios.post(`${GOVERNOR_URL}/onboarding/complete`, business, { headers });

      } else if (step === 2) {
        // Connect Gmail
        await axios.post(`${GOVERNOR_URL}/platforms/connect`, {
          platform: 'gmail',
          account_id: gmail.email,
          account_name: gmail.email,
          status: 'active'
        }, { headers });

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
        // Add test accounts
        for (const ta of testAccounts) {
          if (ta.account_id) {
            await axios.post(`${GOVERNOR_URL}/test_accounts/add`, ta, { headers });
          }
        }
        // Mark onboarding complete
        await axios.post(`${GOVERNOR_URL}/onboarding/complete`, { ...business, onboarding_complete: true }, { headers });
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

  const progress = ((step - 1) / (steps.length - 1)) * 100;

  return (
    <div className="min-height-screen flex" style={{ background: 'linear-gradient(160deg, #0a1628 0%, #0d2d3a 50%, #0a2518 100%)', minHeight: '100vh' }}>

      {/* Left sidebar */}
      <div className="hidden lg:flex flex-col w-72 p-8 border-r border-white/10">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center">
            <Bot size={20} color="#fff" />
          </div>
          <span className="text-white font-semibold text-lg">Vertex AI</span>
        </div>

        <div className="space-y-2">
          {steps.map((s) => (
            <div key={s.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              s.id === step ? 'bg-white/10' : ''
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                s.id < step ? 'gradient-bg' :
                s.id === step ? 'border-2 border-teal-400' :
                'border border-white/20'
              }`}>
                {s.id < step
                  ? <Check size={14} color="#fff" />
                  : <s.icon size={14} color={s.id === step ? '#00c9a7' : 'rgba(255,255,255,0.3)'} />
                }
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
          <p className="text-white/40 text-xs mt-2">{step} of {steps.length} steps</p>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-lg">

          {/* Step indicator mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-6">
            {steps.map(s => (
              <div key={s.id} className={`h-1 flex-1 rounded-full ${s.id <= step ? 'gradient-bg' : 'bg-white/20'}`} />
            ))}
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            {/* Step 1 — Business Profile */}
            {step === 1 && (
              <div>
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                  <Building size={22} color="#fff" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Business Profile</h2>
                <p className="text-gray-400 text-sm mb-6">Tell us about your business so AI can represent you better.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Business name</label>
                    <input value={business.business_name} onChange={e => setBusiness({...business, business_name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                      placeholder="Vertex AI Solutions" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Industry</label>
                    <select value={business.industry} onChange={e => setBusiness({...business, industry: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400">
                      <option value="">Select industry</option>
                      {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Website <span className="text-gray-300">(optional)</span></label>
                    <input value={business.website} onChange={e => setBusiness({...business, website: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                      placeholder="https://yourwebsite.com" />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Gmail */}
            {step === 2 && (
              <div>
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                  <Mail size={22} color="#fff" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Connect Gmail</h2>
                <p className="text-gray-400 text-sm mb-6">Your Gmail will be monitored for incoming messages and meeting requests.</p>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Check size={16} color="#16a34a" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-800">Auto-connected</p>
                    <p className="text-xs text-green-600">{gmail.email}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 mt-4">Your signup email is automatically connected. The AI will monitor this inbox and reply on your behalf.</p>
              </div>
            )}

            {/* Step 3 — Instagram */}
            {step === 3 && (
              <div>
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                  <Instagram size={22} color="#fff" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Connect Instagram</h2>
                <p className="text-gray-400 text-sm mb-6">Link your Instagram Business account to handle DMs automatically.</p>

                {!instagram.skip ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Instagram Account ID</label>
                      <input value={instagram.account_id} onChange={e => setInstagram({...instagram, account_id: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                        placeholder="e.g. 17841478520495248" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Facebook Page ID</label>
                      <input value={instagram.page_id} onChange={e => setInstagram({...instagram, page_id: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                        placeholder="e.g. 1003745256147352" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Page Access Token</label>
                      <input value={instagram.access_token} onChange={e => setInstagram({...instagram, access_token: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                        placeholder="EAAxxxxxxx..." type="password" />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Shield size={12} />
                      <span>Token is encrypted and stored securely</span>
                    </div>
                    <button onClick={() => setInstagram({...instagram, skip: true})} className="text-sm text-gray-400 underline">
                      Skip for now
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">Instagram skipped — you can connect it later from Settings.</p>
                    <button onClick={() => setInstagram({...instagram, skip: false})} className="text-sm text-yellow-600 underline mt-2">
                      Connect now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 4 — Facebook */}
            {step === 4 && (
              <div>
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                  <Facebook size={22} color="#fff" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Connect Facebook</h2>
                <p className="text-gray-400 text-sm mb-6">Link your Facebook Page to handle Messenger messages automatically.</p>

                {!facebook.skip ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Facebook Page ID</label>
                      <input value={facebook.page_id} onChange={e => setFacebook({...facebook, page_id: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                        placeholder="e.g. 1003745256147352" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Page Name</label>
                      <input value={facebook.account_name} onChange={e => setFacebook({...facebook, account_name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                        placeholder="Your Page Name" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Page Access Token</label>
                      <input value={facebook.access_token} onChange={e => setFacebook({...facebook, access_token: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                        placeholder="EAAxxxxxxx..." type="password" />
                    </div>
                    <button onClick={() => setFacebook({...facebook, skip: true})} className="text-sm text-gray-400 underline">
                      Skip for now
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">Facebook skipped — you can connect it later from Settings.</p>
                    <button onClick={() => setFacebook({...facebook, skip: false})} className="text-sm text-yellow-600 underline mt-2">
                      Connect now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 5 — WhatsApp */}
            {step === 5 && (
              <div>
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                  <MessageCircle size={22} color="#fff" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Connect WhatsApp</h2>
                <p className="text-gray-400 text-sm mb-6">Link your WhatsApp Business number for AI-powered messaging.</p>

                {!whatsapp.skip ? (
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Phone Number ID</label>
                      <input value={whatsapp.phone_number_id} onChange={e => setWhatsapp({...whatsapp, phone_number_id: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                        placeholder="e.g. 123456789012345" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Display Name</label>
                      <input value={whatsapp.account_name} onChange={e => setWhatsapp({...whatsapp, account_name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                        placeholder="Vertex AI Solutions" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">Access Token</label>
                      <input value={whatsapp.access_token} onChange={e => setWhatsapp({...whatsapp, access_token: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                        placeholder="EAAxxxxxxx..." type="password" />
                    </div>
                    <button onClick={() => setWhatsapp({...whatsapp, skip: true})} className="text-sm text-gray-400 underline">
                      Skip for now
                    </button>
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <p className="text-sm text-yellow-800">WhatsApp skipped — you can connect it later from Settings.</p>
                    <button onClick={() => setWhatsapp({...whatsapp, skip: false})} className="text-sm text-yellow-600 underline mt-2">
                      Connect now
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Step 6 — Test Accounts */}
            {step === 6 && (
              <div>
                <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mb-4">
                  <Shield size={22} color="#fff" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Test Accounts</h2>
                <p className="text-gray-400 text-sm mb-2">Add test accounts that can message your bot during development mode.</p>
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-6">
                  <p className="text-xs text-blue-700">In Meta development mode, only whitelisted accounts can interact with your bot. Add up to 5 per platform.</p>
                </div>

                <div className="space-y-3">
                  {testAccounts.map((ta, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select value={ta.platform} onChange={e => {
                        const updated = [...testAccounts];
                        updated[i].platform = e.target.value;
                        setTestAccounts(updated);
                      }} className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400 w-32">
                        <option value="instagram">Instagram</option>
                        <option value="facebook">Facebook</option>
                        <option value="whatsapp">WhatsApp</option>
                      </select>
                      <input value={ta.account_id} onChange={e => {
                        const updated = [...testAccounts];
                        updated[i].account_id = e.target.value;
                        setTestAccounts(updated);
                      }} className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-teal-400"
                        placeholder="Account ID or phone number" />
                      <button onClick={() => setTestAccounts(testAccounts.filter((_, j) => j !== i))}
                        className="text-gray-400 hover:text-red-400">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {testAccounts.length < 5 && (
                    <button onClick={() => setTestAccounts([...testAccounts, { platform: 'instagram', account_id: '', account_name: '' }])}
                      className="flex items-center gap-2 text-sm text-teal-600 font-medium">
                      <Plus size={16} /> Add test account
                    </button>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              {step > 1 ? (
                <button onClick={() => setStep(s => s - 1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700">
                  <ArrowLeft size={16} /> Back
                </button>
              ) : <div />}

              <button
                onClick={handleNext}
                disabled={loading}
                className="flex items-center gap-2 text-white text-sm font-medium px-6 py-3 rounded-xl gradient-bg disabled:opacity-50"
              >
                {loading ? 'Saving...' : step === 6 ? 'Complete Setup' : 'Continue'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </div>

            {step < 6 && (
              <p className="text-center text-xs text-gray-400 mt-4">
                <button onClick={() => onComplete()} className="underline">Skip all and go to dashboard</button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}