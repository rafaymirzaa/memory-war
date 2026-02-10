import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173", // adjust to your frontend URL
    methods: ["GET", "POST"]
  }
});

// middleware
app.use(cors());
app.use(express.json());

// score schema directly in server.js
const scoreSchema = new mongoose.Schema(
  {
    playerName: {
      type: String,
      required: true,
      trim: true,
    },
    score: {
      type: Number,
      required: true,
    },
    highScore: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const Score = mongoose.model("Score", scoreSchema);

const MONGO_URI = process.env.MONGO_URI
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));
// socket.io 
const activePlayers = new Map(); // store active players

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('player:join', (playerName) => {
    activePlayers.set(socket.id, { 
      playerName, 
      score: 0, 
      highScore: 0 
    });
    
    // broadcasting not emitting
    io.emit('players:update', Array.from(activePlayers.values()));
    
    //   message about new player
    io.emit('chat:message', {
      playerName: 'System',
      message: `${playerName} joined the game!`,
      timestamp: Date.now()
    });
  });

  //  chat messages
  socket.on('chat:send', ({ playerName, message }) => {
    io.emit('chat:message', {
      playerName,
      message,
      timestamp: Date.now()
    });
  });

  //  score updates
  socket.on('score:update', ({ playerName, score, highScore }) => {
    const player = activePlayers.get(socket.id);
    if (player) {
      player.score = score;
      player.highScore = highScore;
      activePlayers.set(socket.id, player);
      
      //  updated scores to all clients
      io.emit('players:update', Array.from(activePlayers.values()));
    }
  });

  // card click - when a player clicks a card, broadcast to other players
  socket.on('game:cardClick', ({ playerName, cardId, score, clickedCards }) => {
    // broadcast to all other players (not the sender)
    socket.broadcast.emit('game:cardClick', {
      playerName,
      cardId,
      score,
      clickedCards
    });
  });

  // game state sync - when a player's game state changes
  socket.on('game:stateUpdate', ({ playerName, cards, clickedCards, score }) => {
    // broadcast to all other players
    socket.broadcast.emit('game:stateUpdate', {
      playerName,
      cards,
      clickedCards,
      score
    });
  });

  //  disconnects
  socket.on('disconnect', () => {
    const player = activePlayers.get(socket.id);
    if (player) {
      io.emit('chat:message', {
        playerName: 'System',
        message: `${player.playerName} left the game.`,
        timestamp: Date.now()
      });
      activePlayers.delete(socket.id);
      io.emit('players:update', Array.from(activePlayers.values()));
    }
    console.log('User disconnected:', socket.id);
  });
});

// REST API endpoints for the app

// all scores
app.get('/scores', async (req, res) => {
  try {
    const scores = await Score.find().sort({ highScore: -1, createdAt: -1 }).limit(10);
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// score by player name
app.get('/scores/:playerName', async (req, res) => {
  try {
    const score = await Score.findOne({ playerName: req.params.playerName });
    if (!score) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json(score);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// create/update score
app.post('/scores', async (req, res) => {
  try {
    const { playerName, score, highScore } = req.body;

    let existingScore = await Score.findOne({ playerName });

    if (existingScore) {
      if (highScore > existingScore.highScore) {
        existingScore.highScore = highScore;
        existingScore.score = score;
        await existingScore.save();
      }
      res.json(existingScore);
    } else {
      // Create new score entry
      const newScore = new Score({
        playerName,
        score,
        highScore,
      });
      await newScore.save();
      res.status(201).json(newScore);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// delete score
app.delete('/scores/:playerName', async (req, res) => {
  try {
    const deletedScore = await Score.findOneAndDelete({ playerName: req.params.playerName });
    if (!deletedScore) {
      return res.status(404).json({ message: 'Player not found' });
    }
    res.json({ message: 'Score deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});