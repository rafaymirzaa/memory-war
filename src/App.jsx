import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";


const SOCKET_URL = 'http://44.211.94.94';
export default function App() {
  const [playerName, setPlayerName] = useState("");
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    // Notify server when player name is set
    if (socket && playerName) {
      socket.emit('player:join', playerName);
    }
  }, [socket, playerName]);

  return (
    <>
      <Outlet context={{ playerName, setPlayerName, socket }} />
    </>
  );
}