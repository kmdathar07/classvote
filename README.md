# 🎓 ClassVote — Real-Time Classroom Voting Platform

![React](https://img.shields.io/badge/Frontend-React-blue)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green)
![Supabase](https://img.shields.io/badge/Database-Supabase-black)
![Vercel](https://img.shields.io/badge/Frontend%20Hosting-Vercel-black)
![Render](https://img.shields.io/badge/Backend%20Hosting-Render-purple)

A **full-stack real-time classroom polling platform** where teachers can create live polls and students can vote instantly using a **room code or QR code**.

Votes update **live using WebSockets**, making it perfect for classrooms, workshops, and seminars.

---

# 🚀 Live Demo

🌐 **Frontend:**  
`https://classvote-delta.vercel.app/`

⚡ **Backend API:**  
`https://classvote-pis7.onrender.com`

📚 **API Docs:**  
`https://classvote-pis7.onrender.com/docs`

---

# 📁 Project Structure


## 📁 Project Structure

```
classvote/
│
├── frontend/                     # React + Vite + Tailwind
│   ├── src/
│   │   ├── pages/
│   │   │   ├── LoginPage
│   │   │   ├── Dashboard
│   │   │   ├── CreateRoom
│   │   │   ├── HostRoom
│   │   │   └── AttendeeRoom
│   │   │
│   │   ├── hooks/
│   │   │   └── useWebSocket.js
│   │   │
│   │   └── utils/
│   │       ├── api.js
│   │       └── auth.js
│   │
│   ├── index.css
│   ├── package.json
│   └── vercel.json
│
├── backend/                      # FastAPI + Python
│   ├── routers/
│   │   ├── users.py
│   │   ├── rooms.py
│   │   ├── votes.py
│   │   └── questions.py
│   │
│   ├── services/
│   │   ├── database.py
│   │   └── connection_manager.py
│   │
│   ├── main.py
│   ├── requirements.txt
│   └── render.yaml
│
└── docs/
    └── schema.sql                # Supabase PostgreSQL schema
```

---

# ✨ Features

| Feature | Status |
|------|------|
| Email / Name login | ✅ |
| Host & Attendee roles | ✅ |
| Create rooms with multiple questions | ✅ |
| QR code room join | ✅ |
| Real-time voting via WebSockets | ✅ |
| Live bar chart results | ✅ |
| Anonymous voting mode | ✅ |
| Live participant counter | ✅ |
| Reaction system (👍 👎 🤔) | ✅ |
| Kick users from room | ✅ |
| Export results to CSV | ✅ |
| Room history dashboard | ✅ |
| Auto room expiry | ✅ |
| Dark mode | ✅ |
| Mobile-responsive UI | ✅ |

---

# ⚙️ How It Works

1️⃣ Teacher logs in using **email + name**

2️⃣ Teacher creates a **room with questions**

3️⃣ System generates a **room code + QR code**

4️⃣ Students **scan QR code or enter room code**

5️⃣ Students vote instantly on their phones

6️⃣ **Host dashboard updates live via WebSockets**

7️⃣ Teacher can **close voting & export results**

---

# 🛠 Tech Stack

### Frontend
- React 18
- Vite
- Tailwind CSS
- Framer Motion
- Recharts
- qrcode.react

### Backend
- FastAPI
- Python
- WebSockets
- Uvicorn

### Database
- Supabase (PostgreSQL)

### Deployment
- **Frontend:** Vercel
- **Backend:** Render

---

# 🔌 API Endpoints

| Method | Endpoint | Description |
|------|------|------|
| POST | `/api/users/login` | Login or create user |
| GET | `/api/users/{id}/rooms` | Get host's room history |
| POST | `/api/rooms/` | Create room |
| GET | `/api/rooms/{code}` | Get room details |
| GET | `/api/rooms/{code}/results` | Get live results |
| POST | `/api/rooms/{code}/close` | Close room |
| POST | `/api/rooms/{code}/kick/{user_id}` | Kick participant |
| POST | `/api/votes/` | Submit vote |
| POST | `/api/votes/join` | Join room |
| GET | `/api/votes/export/{code}` | Export CSV |
| WS | `/ws/{room_code}/{user_id}` | WebSocket connection |

---

# 💻 Local Development

## 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/classvote.git
cd classvote
2️⃣ Backend Setup
cd backend

python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

cp .env.example .env

Run server:

uvicorn main:app --reload

Backend runs on:

http://localhost:8000
3️⃣ Frontend Setup
cd frontend

npm install

cp .env.example .env
npm run dev

Frontend runs on:

http://localhost:5173
🌍 Deployment
Backend — Render

Root Directory → backend

Build Command

pip install -r requirements.txt

Start Command

uvicorn main:app --host 0.0.0.0 --port $PORT

Environment Variables:

SUPABASE_URL
SUPABASE_SERVICE_KEY
FRONTEND_URL
Frontend — Vercel

Root Directory → frontend

Framework → Vite

Environment Variables:

VITE_API_URL
VITE_WS_URL
📊 System Architecture
User
 ↓
Vercel (React Frontend)
 ↓
Render (FastAPI Backend)
 ↓
Supabase (PostgreSQL)
👨‍💻 Author

Mohammed Athar K

BCA — VIT Vellore
Full-Stack Developer

⭐ If you like this project

Give it a star on GitHub ⭐