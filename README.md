# 🧠 Memory Wars

A real-time multiplayer memory card game built with React, Node.js, Socket.io, and MongoDB — deployed on AWS EC2.

![Game](https://img.shields.io/badge/status-live-brightgreen) ![React](https://img.shields.io/badge/React-Vite-blue) ![Node](https://img.shields.io/badge/Backend-Node.js-green) ![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-darkgreen) ![AWS](https://img.shields.io/badge/Hosted-AWS_EC2-orange)

## 🌍 Live Demo

```
http://44.211.94.94
```

---

## 🎮 What It Does

- Flip cards and try not to click the same one twice
- Real-time multiplayer — see your opponent's game live
- High scores saved to a cloud database
- In-game chat between players
- Live player list showing who's online
- User authentication with email/password or Google

---

## 🛠 Tech Stack

### Frontend
- **React** (Vite)
- **Framer Motion** — animations
- **Socket.io Client** — real-time multiplayer
- **Firebase Auth** — user authentication (email + Google)
- **React Router** — page navigation

### Backend
- **Node.js** + **Express** — REST API
- **Socket.io** — real-time game state sync and chat
- **Mongoose** + **MongoDB Atlas** — cloud database for scores
- **dotenv** — environment variable management

### Infrastructure
- **AWS EC2** (Ubuntu 24) — cloud server
- **PM2** — process manager, keeps backend alive 24/7
- **Nginx** — reverse proxy, serves frontend and routes API traffic

---

## 🗂 Project Structure

```
memory-wars/
├── src/
│   ├── components/
│   │   ├── GameBoard.jsx       # Card grid
│   │   ├── GameController.jsx  # Game logic + score saving
│   │   ├── Multiplayer.jsx     # Two-player layout
│   │   ├── ChatBox.jsx         # Real-time chat
│   │   ├── PlayerList.jsx      # Live online players
│   │   └── Score.jsx           # Score display
│   ├── pages/
│   │   ├── Welcome.jsx         # Auth page (login + signup)
│   │   ├── Game.jsx            # Main game page
│   │   ├── GameOver.jsx        # End screen + leaderboard
│   │   └── pages.jsx           # Route definitions
│   ├── firebase.js             # Firebase config + auth setup
│   └── App.jsx                 # Root component + socket init
├── server/
│   └── server.js               # Express + Socket.io backend
├── public/
└── index.html
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js 18+
- A MongoDB Atlas account
- A Firebase project

### 1. Clone the repo

```bash
git clone https://github.com/rafaymirzaa/memory-war.git
cd memory-war
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Set up environment variables

Create a `.env` file inside the `server/` folder:

```
MONGO_URI=your_mongodb_atlas_connection_string
PORT=5000
```

### 5. Set up Firebase

Create `src/firebase.js` with your own Firebase project config:

```js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
```

### 6. Run the backend

```bash
cd server
node server.js
```

### 7. Run the frontend

```bash
# from project root
npm run dev
```

Frontend runs at `http://localhost:5173`
Backend runs at `http://localhost:5000`

---

## 🚀 Deployment (AWS EC2)

### Backend

```bash
# SSH into server
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Start with PM2
pm2 start server.js --name backend
pm2 save
pm2 startup
```

### Frontend

```bash
# Build on your machine
npm run build

# Copy to EC2
scp -i your-key.pem -r dist/ ubuntu@YOUR_EC2_IP:~/frontend

# On EC2 — copy to Nginx
sudo cp -r ~/frontend/* /var/www/html/
```

### Nginx Config

```nginx
server {
    listen 80;

    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /scores {
        proxy_pass http://localhost:5000;
    }
}
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| GET | `/scores` | Get top 10 high scores |
| GET | `/scores/:playerName` | Get a player's score |
| POST | `/scores` | Create or update a score |
| DELETE | `/scores/:playerName` | Delete a player's score |

---

## ⚡ Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `player:join` | Client → Server | Player enters the game |
| `players:update` | Server → All | Updated list of online players |
| `score:update` | Client → Server | Player's score changed |
| `game:stateUpdate` | Client → Server | Card state sync for multiplayer |
| `chat:send` | Client → Server | Send a chat message |
| `chat:message` | Server → All | Broadcast chat message |

---

## 🔐 Authentication

Built with **Firebase Authentication** supporting:
- Email and password signup/login
- Google OAuth login
- Display name set on signup becomes the in-game player name

---

## 📝 Environment Variables

| Variable | Location | Description |
|----------|----------|-------------|
| `MONGO_URI` | `server/.env` | MongoDB Atlas connection string |
| `PORT` | `server/.env` | Backend port (default 5000) |

> ⚠️ Never commit your `.env` file. It is already in `.gitignore`.

---

## 👤 Author

**Rafay Mirza** — [@rafaymirzaa](https://github.com/rafaymirzaa)