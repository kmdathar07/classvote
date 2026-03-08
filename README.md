# 🎓 ClassVote — Real-Time Classroom Voting Platform

A full-stack SaaS platform for live classroom polls and voting. Teachers create rooms instantly, students join via QR code or room code, and results update in real-time using WebSockets.

---

## 📁 Project Structure

```
classvote/
├── frontend/               # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/          # LoginPage, Dashboard, CreateRoom, HostRoom, AttendeeRoom, etc.
│   │   ├── hooks/          # useWebSocket.js
│   │   ├── utils/          # api.js, auth.js
│   │   └── index.css       # Global styles
│   ├── .env.example
│   ├── package.json
│   └── vercel.json
├── backend/                # FastAPI + Python
│   ├── routers/            # users.py, rooms.py, votes.py, questions.py
│   ├── services/           # database.py, connection_manager.py
│   ├── main.py
│   ├── requirements.txt
│   └── render.yaml
└── docs/
    └── schema.sql          # Supabase PostgreSQL schema
```

---

## 🚀 Quick Start

### STEP 1 — Supabase Database Setup

1. Go to [supabase.com](https://supabase.com) → Create new project
2. In the SQL Editor, paste and run the contents of `docs/schema.sql`
3. Go to **Settings → API** and copy:
   - **Project URL** → `SUPABASE_URL`
   - **service_role (secret)** key → `SUPABASE_SERVICE_KEY`

---

### STEP 2 — Backend Setup (FastAPI)

```bash
cd classvote/backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run the server
uvicorn main:app --reload --port 8000
```

**Backend is now running at:** `http://localhost:8000`
**API docs at:** `http://localhost:8000/docs`

---

### STEP 3 — Frontend Setup (React + Vite)

```bash
cd classvote/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env if backend is on a different port/URL

# Start dev server
npm run dev
```

**Frontend is now running at:** `http://localhost:5173`

---

## 🌍 Deployment

### Deploy Backend to Render

1. Push your project to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your GitHub repo, set **Root Directory** to `backend`
4. Build command: `pip install -r requirements.txt`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `FRONTEND_URL` (your Vercel URL)
7. Deploy → Copy your Render URL (e.g. `https://classvote-api.onrender.com`)

### Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your GitHub repo, set **Root Directory** to `frontend`
3. Framework: **Vite**
4. Add environment variables:
   - `VITE_API_URL` = `https://classvote-api.onrender.com`
   - `VITE_WS_URL` = `wss://classvote-api.onrender.com`
5. Deploy → Your app is live! 🚀

---

## ✨ Features

| Feature | Status |
|---------|--------|
| Email/Name login (no password) | ✅ |
| Host & Attendee roles | ✅ |
| Create rooms with multiple questions | ✅ |
| Room code + QR code generation | ✅ |
| Real-time voting via WebSockets | ✅ |
| Live animated bar charts (Recharts) | ✅ |
| Anonymous voting mode | ✅ |
| Live participant counter | ✅ |
| Reaction system (👍👎🤔) | ✅ |
| Kick users from room | ✅ |
| Export results to CSV | ✅ |
| Room history dashboard | ✅ |
| Auto room expiry | ✅ |
| Dark mode | ✅ |
| Mobile-first responsive design | ✅ |

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/login` | Login or create user |
| GET | `/api/users/{id}/rooms` | Get host's room history |
| POST | `/api/rooms/` | Create a room |
| GET | `/api/rooms/{code}` | Get room details |
| GET | `/api/rooms/{code}/results` | Get live results |
| POST | `/api/rooms/{code}/close` | Close a room |
| POST | `/api/rooms/{code}/kick/{user_id}` | Kick a participant |
| POST | `/api/votes/` | Submit a vote |
| POST | `/api/votes/join` | Join a room as attendee |
| GET | `/api/votes/export/{code}` | Export CSV |
| WS | `/ws/{room_code}/{user_id}` | WebSocket connection |

---

## 🎯 How It Works

1. **Teacher logs in** with name + email
2. **Creates a room** with title, questions, and options
3. System generates **room code + QR code**
4. Teacher **displays QR code** on their projector
5. **Students scan** with phone camera → auto-redirects to voting page
6. Students **submit votes** with one tap
7. **Host dashboard updates live** via WebSocket
8. Teacher can **close room** and **export CSV results**

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Recharts, qrcode.react, Framer Motion
- **Backend**: FastAPI, Python, Uvicorn, WebSockets
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel (frontend) + Render (backend)
