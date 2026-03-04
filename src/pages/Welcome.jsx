import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";

import {
  auth,
  googleProvider
} from "../firebase";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from "firebase/auth";

export default function Welcome() {
  const navigate = useNavigate();
  const { setPlayerName } = useOutletContext();

  const [isSignup, setIsSignup] = useState(true);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleEmailAuth(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        if (!displayName.trim()) {
          setError("Please enter a display name!");
          setLoading(false);
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: displayName.trim() });
        setPlayerName(displayName.trim());
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setPlayerName(userCredential.user.displayName || userCredential.user.email);
      }
      navigate("/game");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      setPlayerName(userCredential.user.displayName);
      navigate("/game");
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      className="welcome-card"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <motion.h1
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {isSignup ? "Create Account" : "Welcome Back"}
      </motion.h1>

      {isSignup && (
        <motion.input
          type="text"
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          whileFocus={{ scale: 1.02 }}
        />
      )}

      <motion.input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        whileFocus={{ scale: 1.02 }}
      />

      <motion.input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        whileFocus={{ scale: 1.02 }}
      />

      {error && (
        <motion.p
          className="error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {error}
        </motion.p>
      )}

      <motion.button
        onClick={handleEmailAuth}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={loading}
      >
        {loading ? "Loading..." : isSignup ? "Sign Up" : "Log In"}
      </motion.button>

      <motion.button
        className="google-btn"
        onClick={handleGoogle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={loading}
      >
        Continue with Google
      </motion.button>

      <p
        className="toggle-auth"
        onClick={() => { setIsSignup(!isSignup); setError(""); }}
      >
        {isSignup ? "Already have an account? Log in" : "No account? Sign up"}
      </p>
    </motion.div>
  );
}