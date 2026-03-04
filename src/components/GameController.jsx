import GameBoard from "./GameBoard";
import Score from "./Score";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";

const API_URL = 'http://44.211.94.94'; // always live on t3.micro working with nginx reverse proxy

export default function GameController({ playerName, socket, isPlayer1 = true, disabled = false }) {
  const navigate = useNavigate();
  // game states
 
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [image, setImage] = useState([]);
  const [clicked, setClicked] = useState([]);
 
  // fetch player's existing high score on mount
  useEffect(() => {
    async function fetchPlayerScore() {
      try {
        const res = await fetch(`${API_URL}/scores/${playerName}`);
        if (res.ok) {
          const data = await res.json();
          setHighScore(data.highScore);
          
          //  socket with initial high score
          if (socket) {
            socket.emit('score:update', {
              playerName,
              score: 0,
              highScore: data.highScore
            });
          }
        }
      } catch (error) {
        console.log('No existing score found');
      }
    }
    
    if (playerName) {
      fetchPlayerScore();
    }
  }, [playerName, socket]);

  useEffect(() => {
    async function fetchCard() {
      const res = await fetch('https://rickandmortyapi.com/api/character');
      const data = await res.json();
      const imageTile = data.results
        .slice(0, 9)
        .filter((f, index) => index !== 5) // roots out any of the card you dont want from the api
        .map((char) => ({
          id: char.id,
          image: char.image,
        }));
      setImage(imageTile);
    }
    fetchCard();
  }, []);

  //  updated when score changes
  useEffect(() => {
    if (socket && playerName) {
      socket.emit('score:update', {
        playerName,
        score,
        highScore
      });
    }
  }, [score, highScore, socket, playerName]);

  // for game state updates from other player (only if this is player 2 view)
  useEffect(() => {
    if (!socket || isPlayer1 || disabled) return;

    const handleGameStateUpdate = (data) => {
      if (data.playerName === playerName && !isPlayer1) {
        if (data.cards) setImage(data.cards);
        if (data.clickedCards) setClicked(data.clickedCards);
        if (data.score !== undefined) setScore(data.score);
      }
    };

    socket.on('game:stateUpdate', handleGameStateUpdate);

    return () => {
      socket.off('game:stateUpdate', handleGameStateUpdate);
    };
  }, [socket, playerName, isPlayer1, disabled]);

  // save score to database
  async function saveScore(finalScore, finalHighScore) {
    try {
      await fetch(`${API_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName,
          score: finalScore,
          highScore: finalHighScore,
        }),
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }

  function shuffleCards(arr) {
    let shuffled = [...arr];

    for (let i = shuffled.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setImage(shuffled);
  }

  const handleClick = (id) => {
    if (disabled) 
      return; 
    
    // Only allow clicks for player 1 (current player's own game)
    if (!isPlayer1) return;
    
    if (clicked.includes(id)) {
      // save score before navigating
      saveScore(score, highScore);
      
      navigate('/gameover', {
        state: {
          score,
          highScore,
          playerName,
        },
        replace: true,
      });
      
      setScore(0);
      setClicked([]);
    } else {
      const newScore = score + 1;
      const newClicked = [...clicked, id];
      const shuffledCards = [...image];
      
      // Shuffle cards
      for (let i = shuffledCards.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
      }
      
      setScore((prev) => {
        const newScore = prev + 1;
        if (newScore > highScore) {
          setHighScore(newScore);
          saveScore(newScore, newScore);
        }
        return newScore;
      });
      setClicked(newClicked);
      setImage(shuffledCards);
      
      // Emit game state update to sync with other players
      if (socket) {
        socket.emit('game:stateUpdate', {
          playerName,
          cards: shuffledCards,
          clickedCards: newClicked,
          score: newScore
        });
      }
    }
  };

  return (
    // AI helped me with this logic since i am using it for CSS and CSS only
    <div className={`game-controller ${disabled ? 'inactive' : ''}`}>
      <GameBoard cards={image} onCardsClick={handleClick} disabled={disabled} />
      <Score score={score} highScore={highScore} playerName={playerName} />
    </div>
  );
}