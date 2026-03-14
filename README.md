# 🎤 InterviewRoom — Setup & Run Guide

A private two-person video interview platform using WebRTC + Socket.io.

---

## Prerequisites

- Node.js v16+ installed (https://nodejs.org)
- A terminal / command prompt
- Two browsers (or two different computers on the same network / internet)

---

## Step 1 — Install dependencies

```bash
cd backend
npm install
```

---

## Step 2 — Start the server

```bash
node server.js
```

You should see:
```
✅  Interview server running on http://localhost:3000
```

---

## Step 3 — Open in your browser

Go to: http://localhost:3000

---

## Step 4 — Create a room

1. Click **"+ Create Interview Room"**
2. You'll get a Room ID (e.g. `abc12345`) and a shareable link
3. Copy the link

---

## Step 5 — Share the link with your partner

Send the link to your partner. They open it in their browser.

---

## Step 6 — Both join the room

- **You**: select a role (Candidate or Interviewer) → click **Join Room**
- **Partner**: paste the Room ID or open the shared link → select the OTHER role → click **Join Room**

Once both join, WebRTC negotiation happens automatically.
Video and audio will appear within a few seconds.

---

## Testing from TWO DIFFERENT COMPUTERS

### Option A — Same WiFi network (easiest)
Find your local IP address:
- Windows: run `ipconfig` → look for IPv4 Address (e.g. 192.168.1.5)
- Mac/Linux: run `ifconfig` or `ip addr`

Your partner opens: http://192.168.1.5:3000

### Option B — Over the Internet (using ngrok — free)
1. Install ngrok: https://ngrok.com/download
2. Run: `ngrok http 3000`
3. ngrok gives you a public URL like: https://abc123.ngrok.io
4. Share that URL with your partner

### Option C — Deploy to Railway / Render (free hosting)
See deployment section below.

---

## Controls inside the room

| Button | Action |
|--------|--------|
| 🎙️ | Mute / unmute your microphone |
| 📷 | Turn camera on / off |
| Leave | Leave the room |
| Chat box | Send text messages to your partner |

---

## Project Structure

```
interview-platform/
├── backend/
│   ├── server.js              ← Express + Socket.io server
│   ├── package.json
│   └── sockets/
│       └── interviewSocket.js ← All WebSocket signaling logic
└── frontend/
    └── index.html             ← Full UI (served by Express)
```

---

## Free Deployment (share with anyone on the internet)

### Deploy to Railway (recommended, free tier)

1. Create account at https://railway.app
2. Click "New Project" → "Deploy from GitHub"
3. Push your code to GitHub first
4. Set root directory to `backend`
5. Railway auto-detects Node.js and runs `npm start`
6. You get a public URL like: https://yourapp.up.railway.app

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Camera permission denied | Click the camera icon in browser address bar and allow |
| Video not showing | Make sure BOTH users have joined with DIFFERENT roles |
| Can't connect on different computers | Use ngrok or deploy to Railway |
| Port 3000 already in use | Change PORT in server.js or run `PORT=3001 node server.js` |
