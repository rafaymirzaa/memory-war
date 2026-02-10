import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatBox({ socket, playerName }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Listen for incoming messages
    socket.on('chat:message', (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => {
      socket.off('chat:message');
    };
  }, [socket]);

  useEffect(() => {
    // auto scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    socket.emit('chat:send', {
      playerName,
      message: inputMessage.trim()
    });

    setInputMessage('');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {}
      <motion.button
        className="chat-toggle"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        💬
      </motion.button>

      {}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="chatbox"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <div className="chatbox-header">
              <h3>Chat</h3>
              <button onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="chatbox-messages">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`chat-message ${
                    msg.playerName === 'System' ? 'system-message' : ''
                  } ${msg.playerName === playerName ? 'own-message' : ''}`}
                >
                  <span className="message-author">{msg.playerName}</span>
                  <span className="message-text">{msg.message}</span>
                  <span className="message-time">{formatTime(msg.timestamp)}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <form className="chatbox-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                maxLength={200}
              />
              <button type="submit">Send</button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}