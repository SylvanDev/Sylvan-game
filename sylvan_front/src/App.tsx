// src/App.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { audioPlayer } from "./Layout";

const App: React.FC = () => {
  const { connected } = useWallet();
  const navigate = useNavigate();
  
  const [isInteracted, setIsInteracted] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (connected) {
      setFadeOut(true);
      setTimeout(() => navigate("/lands"), 1000);
    }
  }, [connected, navigate]);

  const handleEnter = () => {
    setIsInteracted(true);
    if (audioPlayer.paused) {
      audioPlayer.play().catch(error => {
        console.error("Audio autoplay failed:", error);
      });
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
        opacity: fadeOut ? 0 : 1,
        transition: "opacity 1s ease-in-out",
        backgroundColor: "black",
        cursor: isInteracted ? 'default' : 'pointer'
      }}
      onClick={!isInteracted ? handleEnter : undefined}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          objectFit: "cover",
          top: 0,
          left: 0,
          zIndex: 0,
        }}
      >
        <source src="/planet.mp4" type="video/mp4" />
      </video>

      <div
        style={{
          position: "relative", zIndex: 1, color: "white", height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", textAlign: "center",
          transition: "opacity 1.5s ease",
        }}
      >
        {!isInteracted ? (
          <div style={{ animation: 'pulse 2s infinite' }}>
            <h2 style={{ fontSize: '2rem', textShadow: '0 0 15px #fff' }}>[ ENTER ]</h2>
          </div>
        ) : (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            animation: 'fadeIn 1.5s'
          }}>
            <h1 style={{ fontSize: "clamp(2.5rem, 10vw, 4rem)", fontWeight: "bold", color: "#00ffbb", textShadow: "0 0 25px #00ffcc", letterSpacing: "3px", marginBottom: "1rem" }}>
              SYLVAN
            </h1>
            <h2 style={{ fontSize: "clamp(1.2rem, 5vw, 1.5rem)", fontWeight: "normal", marginBottom: "0.5rem", textShadow: "0 0 12px #00ffcc" }}>
              🌍 Reclaim the Planet
            </h2>
            
            <div style={{ marginTop: "25px" }}>
              <WalletMultiButton />
            </div>

            {/* БЛОК DEVNET */}
            <div style={{
              marginTop: "30px",
              padding: "15px",
              background: "rgba(255, 215, 0, 0.1)",
              border: "1px solid #ffd700",
              borderRadius: "10px",
              maxWidth: "400px",
              fontSize: "0.9rem",
              backdropFilter: "blur(5px)"
            }}>
              <p style={{ margin: "0 0 10px 0", color: "#ffd700", fontWeight: "bold" }}>
                ⚠️ TEST MODE (DEVNET) ONLY
              </p>
              <p style={{ margin: "0 0 10px 0", lineHeight: "1.4" }}>
                This MVP runs on Solana <b>Devnet</b>.<br/>
                Please switch your wallet network and get free test SOL below:
              </p>
              <a 
                href="https://faucet.solana.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: "#00ffbb", textDecoration: "underline", fontWeight: "bold", cursor: "pointer" }}
              >
                💧 Get Free Test SOL
              </a>
            </div>

            {/* --- НОВЫЙ БЛОК: СОЦСЕТИ --- */}
            <div style={{
              marginTop: "40px",
              display: "flex",
              gap: "25px",
              fontSize: "1.2rem",
              fontWeight: "bold",
              textShadow: "0 0 10px rgba(0,0,0,0.5)"
            }}>
              <a href="https://x.com/SergeySylvan" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                🐦 TWITTER
              </a>
              <a href="https://t.me/sylvangame" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                ✈️ TELEGRAM
              </a>
              <a href="https://discord.gg/W3JB67Tcf3" target="_blank" rel="noopener noreferrer" style={socialLinkStyle}>
                👾 DISCORD
              </a>
            </div>
            {/* --------------------------- */}

          </div>
        )}
      </div>
    </div>
  );
};

// Стили для ссылок (белые, при наведении зеленые - работает через CSS глобально, тут база)
const socialLinkStyle: React.CSSProperties = {
  color: "white",
  textDecoration: "none",
  transition: "color 0.3s ease",
  borderBottom: "1px solid transparent"
};

export default App;