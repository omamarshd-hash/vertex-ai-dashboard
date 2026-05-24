import axios from 'axios';

const GOVERNOR_URL = process.env.REACT_APP_GOVERNOR_URL || 'https://governor-ai-1odr.onrender.com';

const api = axios.create({ baseURL: GOVERNOR_URL, timeout: 30000 });

export const fetchConversations = (platform = '', limit = 50) =>
  api.get('/dashboard/conversations', { params: { platform, limit } });

export const fetchMeetings = () =>
  api.get('/dashboard/meetings');

export const fetchLogs = (limit = 100) =>
  api.get('/dashboard/logs', { params: { limit } });

export const fetchStats = () =>
  api.get('/dashboard/stats');

export const sendMessage = (platform, userId, message) =>
  api.post('/process_message', { platform, user_id: userId, message });

export default api;