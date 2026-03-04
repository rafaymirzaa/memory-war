# Multiplayer Memory Game

A real-time memory card game where you test your recall against other players. Built to learn WebSocket architecture and real-time state synchronization.

![React](https://img.shields.io/badge/React-19.2.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-Express-green)
![Socket.io](https://img.shields.io/badge/Socket.io-4.8.3-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)

## What It Does

Simple concept: click cards without repeating yourself. Each click shuffles the deck and tests your memory. Mess up once and it's game over.

The twist? It's multiplayer. Watch other players' scores climb in real-time, chat with them, and compete for the top spot on the leaderboard.

## Features

**Core Game**
- Memory challenge with dynamic card shuffling
- Rick and Morty themed cards (because why not)
- High scores saved to MongoDB
- Split-screen view showing another player's game alongside yours

**Multiplayer Stuff**
- Real-time chat (with timestamps and system notifications)
- Live player list showing everyone's current scores
- WebSocket-based score synchronization
- Join/leave notifications

## Tech Stack

**Frontend:** React, React Router, Framer Motion, Socket.io Client, Vite  
**Backend:** Node.js, Express 5, Socket.io, MongoDB (Mongoose)  
**Styling:** Custom CSS with glassmorphism effects

## Getting Started

### What You Need
- Node.js (v16+)
- MongoDB running locally or a MongoDB Atlas account
- Two terminal windows

### Setup

**1. Clone and install:**
```bash
git clone <repository-url>
cd memory-game
npm install
```

**2. Backend setup:**
```bash
cd server
npm install

# Create .env file and add:


npm start
```

**3. Frontend setup:**
```bash
# In a new terminal, from project root:
npm run dev
```

**4. MongoDB:**
```bash
# If running locally:
mongod
```


## How to Play

1. Enter your name on the welcome screen
2. Click any card to start
3. Remember which cards you've clicked
4. Cards shuffle after each click
5. Don't click the same card twice
6. Try to beat other players' high scores

Click the 💬 icon for chat, 👥 icon to see active players.

## API Reference

### REST Endpoints

```
GET  /scores              # Top 10 high scores
GET  /scores/:playerName  # Specific player's score
POST /scores              # Create/update score
DELETE /scores/:playerName # Remove player score
```

### Socket Events

**Client → Server:**
- `player:join` - Join with player name
- `chat:send` - Send message
- `score:update` - Update score
- `game:stateUpdate` - Sync game state

**Server → Client:**
- `chat:message` - Broadcast message
- `players:update` - Updated player list
- `game:stateUpdate` - Other player's game state

## Things I'd Improve

- Add proper authentication (currently anyone can use any name)
- Implement game rooms/lobbies for multiple concurrent games
- Add reconnection logic for dropped socket connections
- Input validation and rate limiting
- Proper error boundaries in React
- Unit and integration tests
- Scale beyond 2-player split-screen view

## Learning Takeaways

This was my first dive into real-time web architecture. Key things I learned:

- How WebSockets differ from HTTP polling
- Broadcasting vs. emitting in Socket.io
- Managing state synchronization across clients
- Handling socket lifecycle (connect/disconnect)
- MongoDB integration with Mongoose
- React state management for real-time updates

## Known Issues

- No name collision handling (two "Player1"s will cause conflicts)
- Chat history doesn't persist
- Game state can desync if connection drops
- No mobile optimization yet
- Only shows 2 players max in split-screen view

## Browser Support

Works best in Chrome. Should work in Firefox, Safari, and Edge but less tested.

## License

MIT License - do whatever you want with this

## Questions?

Open an issue or reach out. Happy to discuss the architecture or any problems you run into setting it up.

---

*Built as a learning project to understand real-time multiplayer architecture. Feedback welcome!*