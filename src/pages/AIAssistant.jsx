import React, { useState } from 'react';
import { Bot, Send, Sparkles, Calendar, MessageSquare, Mail } from 'lucide-react';
import axios from 'axios';

const GOVERNOR_URL = process.env.REACT_APP_GOVERNOR_URL || 'https://governor-ai-1odr.onrender.com';

const suggestions = [
  { icon: MessageSquare, text: "Summarize today's conversations" },
  { icon: Calendar, text: "Show my upcoming meetings" },
  { icon: Mail, text: "Draft a professional reply" },
  { icon: Sparkles, text: "What's my most urgent message?" },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hello! I'm your AI Executive Assistant. I can help you manage conversations, schedule meetings, draft replies, and more. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post(`${GOVERNOR_URL}/process_message`, {
        platform: 'dashboard',
        user_id: 'ceo_dashboard',
        message: text
      });
      setMessages(prev => [...prev, { role: 'assistant', text: res.data.reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Sorry, I encountered an issue. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">AI Assistant</h1>
        <p className="text-sm text-gray-500 mt-0.5">Powered by Governor AI</p>
      </div>

      <div className="flex-1 flex flex-col bg-white rounded-xl border border-black/6 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2.5`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                  <Bot size={15} color="#fff" />
                </div>
              )}
              <div className={`max-w-lg px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'gradient-bg text-white rounded-br-sm'
                  : 'bg-gray-50 border border-black/6 text-gray-800 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start gap-2.5">
              <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                <Bot size={15} color="#fff" />
              </div>
              <div className="bg-gray-50 border border-black/6 px-4 py-3 rounded-xl rounded-bl-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-3 grid grid-cols-2 gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => sendMessage(s.text)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-black/8 text-left hover:border-teal-400 transition-colors text-xs text-gray-600"
              >
                <s.icon size={14} color="#00c9a7" />
                {s.text}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-4 py-3 border-t border-black/7 flex gap-2">
          <input
            className="flex-1 text-sm bg-gray-50 border border-black/8 rounded-xl px-4 py-2.5 outline-none focus:border-teal-400"
            placeholder="Ask anything..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim()}
            className="gradient-bg text-white px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-sm font-medium disabled:opacity-50"
          >
            <Send size={14} /> Send
          </button>
        </div>
      </div>
    </div>
  );
}