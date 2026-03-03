import { useLocation, Link } from "react-router";
import { useState, useEffect } from "react";

const API_URL = 'http://44.211.94.94:5000';

const GameOver = () => {
  const location = useLocation();
  const { score = 0, highScore = 0, playerName = '' } = location.state || {};
  
  const [topPlayer, setTopPlayer] = useState(null);
  const [isWinner, setIsWinner] = useState(false);

  useEffect(() => {
    async function fetchTopScore() {
      try {
        const res = await fetch(`${API_URL}/scores`);
        if (res.ok) {
          const scores = await res.json();
          if (scores.length > 0) {
            const winner = scores[0];
            setTopPlayer(winner);
            setIsWinner(winner.playerName === playerName);
          }
        }
      } catch (error) {
        console.error('Error fetching top score:', error);
      }
    }
    
    fetchTopScore();
  }, [playerName]);

  return (
    <div className="game-over">
      <h1>Game Over</h1>
      
      {isWinner && topPlayer && (
        <div className="winner-badge">
          🏆 You're the Top Player! 🏆
        </div>
      )}
      
      <p>Your Score: {score}</p>
      <p>Your High Score: {highScore}</p>
      
      {topPlayer && !isWinner && (
        <div className="top-player-info">
          <p className="top-player-label">Current Top Player</p>
          <p className="top-player-name">{topPlayer.playerName}</p>
          <p className="top-player-score">High Score: {topPlayer.highScore}</p>
        </div>
      )}

      <div className="game-over-buttons">
        <Link to="/game">
          <button>Play Again</button>
        </Link>

        <Link to="/">
          <button>Change Player</button>
        </Link>
      </div>
    </div>
  );
};

export default GameOver;