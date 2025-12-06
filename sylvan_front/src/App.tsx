// src/App.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { audioPlayer } from "./Layout"; // Импортируем наш плеер

const App: React.FC = () => {
  const { connected } = useWallet();
  const navigate = useNavigate();
  
  // --- НОВАЯ ЛОГИКА ---
  // Состояние, которое отслеживает, кликнул ли пользователь для входа
  const [isInteracted, setIsInteracted] = useState(false);
  // -------------------

  const [fadeOut, setFadeOut] = useState(false);

  // Этот useEffect следит за подключением кошелька и отвечает за переход
  useEffect(() => {
    if (connected) {
      setFadeOut(true);
      setTimeout(() => navigate("/lands"), 1000);
    }
  }, [connected, navigate]);

  // --- НОВАЯ ЛОГИКА ---
  // Функция, которая сработает при клике на "заставку"
  const handleEnter = () => {
    setIsInteracted(true); // Показываем основной контент
    
    // Запускаем музыку
    if (audioPlayer.paused) {
      audioPlayer.play().catch(error => {
        console.error("Не удалось запустить музыку:", error);
      });
    }
  };
  // -------------------

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
        cursor: isInteracted ? 'default' : 'pointer' // Меняем курсор на "заставке"
      }}
      // Вешаем обработчик клика на весь экран
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

      {/* --- УСЛОВНЫЙ РЕНДЕРИНГ --- */}
      <div
        style={{
          position: "relative", zIndex: 1, color: "white", height: "100%",
          display: "flex", flexDirection: "column", justifyContent: "center",
          alignItems: "center", textAlign: "center",
          transition: "opacity 1.5s ease",
        }}
      >
        {!isInteracted ? (
          // ЭТО НАША "ЗАСТАВКА"
          <div style={{ animation: 'pulse 2s infinite' }}>
            <h2 style={{ fontSize: '2rem', textShadow: '0 0 15px #fff' }}>[ ENTER ]</h2>
          </div>
        ) : (
          // ЭТО НАШ ОСНОВНОЙ КОНТЕНТ (плавно появляется благодаря CSS)
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
            <p style={{ marginTop: "10px", fontSize: "1rem", opacity: 0.9, textShadow: "0 0 8px #00ffaa", maxWidth: '400px', padding: '0 20px' }}>
              Connect your Solana wallet to start restoring life on Sylvan.
            </p>
            <div style={{ marginTop: "25px" }}>
              <WalletMultiButton />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;