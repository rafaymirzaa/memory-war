import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const httpServer = createServer(app);

// =======================
// Environment Variables
// =======================

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI is missing in .env file");
  process.exit(1);
}

// =======================
// Middleware
// =======================

app.use(cors({ origin: "*" }));
app.use(express.json());

// =======================
// Socket.io Setup
// =======================

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// =======================
// MongoDB Schema
// =======================

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

// =======================
// MongoDB Connection
// =======================

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    // 🔥 LISTEN ON ALL INTERFACES (IMPORTANT FOR AWS)
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Accessible at: http://YOUR_PUBLIC_IP:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// =======================
// Socket.io Logic
// =======================

const activePlayers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("player:join", (playerName) => {
    activePlayers.set(socket.id, {
      playerName,
      score: 0,
      highScore: 0,
    });

    io.emit("players:update", Array.from(activePlayers.values()));

    io.emit("chat:message", {
      playerName: "System",
      message: `${playerName} joined the game!`,
      timestamp: Date.now(),
    });
  });

  socket.on("chat:send", ({ playerName, message }) => {
    io.emit("chat:message", {
      playerName,
      message,
      timestamp: Date.now(),
    });
  });

  socket.on("score:update", ({ score, highScore }) => {
    const player = activePlayers.get(socket.id);

    if (player) {
      player.score = score;
      player.highScore = highScore;
      activePlayers.set(socket.id, player);
      io.emit("players:update", Array.from(activePlayers.values()));
    }
  });

  socket.on("game:cardClick", (data) => {
    socket.broadcast.emit("game:cardClick", data);
  });

  socket.on("game:stateUpdate", (data) => {
    socket.broadcast.emit("game:stateUpdate", data);
  });

  socket.on("disconnect", () => {
    const player = activePlayers.get(socket.id);

    if (player) {
      io.emit("chat:message", {
        playerName: "System",
        message: `${player.playerName} left the game.`,
        timestamp: Date.now(),
      });

      activePlayers.delete(socket.id);
      io.emit("players:update", Array.from(activePlayers.values()));
    }

    console.log("❌ User disconnected:", socket.id);
  });
});

// =======================
// REST API Routes
// =======================

// Health check route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// Get top 10 scores
app.get("/scores", async (req, res) => {
  try {
    const scores = await Score.find()
      .sort({ highScore: -1, createdAt: -1 })
      .limit(10);

    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get score by player name
app.get("/scores/:playerName", async (req, res) => {
  try {
    const score = await Score.findOne({
      playerName: req.params.playerName,
    });

    if (!score) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json(score);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create or update score
app.post("/scores", async (req, res) => {
  try {
    const { playerName, score, highScore } = req.body;

    let existingScore = await Score.findOne({ playerName });

    if (existingScore) {
      if (highScore > existingScore.highScore) {
        existingScore.highScore = highScore;
        existingScore.score = score;
        await existingScore.save();
      }

      return res.json(existingScore);
    }

    const newScore = new Score({
      playerName,
      score,
      highScore,
    });

    await newScore.save();
    res.status(201).json(newScore);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete score
app.delete("/scores/:playerName", async (req, res) => {
  try {
    const deletedScore = await Score.findOneAndDelete({
      playerName: req.params.playerName,
    });

    if (!deletedScore) {
      return res.status(404).json({ message: "Player not found" });
    }

    res.json({ message: "Score deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});