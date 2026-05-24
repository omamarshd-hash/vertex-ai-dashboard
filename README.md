# Vertex AI Dashboard

CEO AI Communication Dashboard — connects to Governor AI backend.

## Setup

```bash
npm install
npm start
```

## Deploy to Vercel

1. Push to GitHub
2. Go to vercel.com → New Project → Import repo
3. Add env var: REACT_APP_GOVERNOR_URL=https://governor-ai-1odr.onrender.com
4. Deploy

## Pages

- / — Dashboard with stats and charts
- /inbox — Unified inbox (all platforms)
- /whatsapp — WhatsApp conversations
- /instagram — Instagram conversations
- /facebook — Facebook conversations
- /gmail — Gmail conversations
- /meetings — All scheduled meetings
- /analytics — Platform analytics