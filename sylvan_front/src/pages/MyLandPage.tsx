import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSylvanGameStore } from "../hooks/useSylvanGameStore";

const landsData: { [key: string]: { name: string; video: string; reclaimedVideo: string } } = {
  desert: { name: "🏜️ Wild Lands", video: "/desert.mp4", reclaimedVideo: "/reclaimed_land.mp4" },
};

const RECLAMATION_TIME = 10;

const MyLandPage: React.FC = () => {
  const navigate = useNavigate();
  const { connected, publicKey } = useWallet();
  const { isInitialized, playerData, setLandReclaimed, setRewardClaimed } = useSylvanGameStore();

  const [isReclaiming, setIsReclaiming] = useState(false);
  const [timer, setTimer] = useState(RECLAMATION_TIME);
  const [claimStatus, setClaimStatus] = useState<"idle" | "loading" | "error">("idle");

  const landInfo = useMemo(() => {
    if (!playerData.landKey) return null;
    return landsData[playerData.landKey];
  }, [playerData.landKey]);

  // ✅ Безопасный переход между страницами
  useEffect(() => {
    if (isInitialized) {
      if (!connected) navigate("/");
      else if (!playerData.landKey) navigate("/lands");
    }
  }, [isInitialized, connected, playerData.landKey, navigate]);

  // ⏳ Таймер рекультивации
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isReclaiming && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (timer === 0 && isReclaiming) {
      setIsReclaiming(false);
      setLandReclaimed();
    }
    return () => clearInterval(interval);
  }, [isReclaiming, timer, setLandReclaimed]);

  const handleStartReclamation = () => {
    setTimer(RECLAMATION_TIME);
    setIsReclaiming(true);
  };

  // 🌱 Получение награды
  const handleClaimReward = async () => {
    if (!publicKey) return alert("Wallet not connected!");
    setClaimStatus("loading");

    try {
      const response = await fetch("http://localhost:4000/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient: publicKey.toBase58() }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Failed to claim reward");

      console.log("Reward claimed successfully. Signature:", result.signature);

      setRewardClaimed();
      alert("🎉 Reward claimed successfully! Check your Devnet wallet.");

    } catch (error: any) {
      console.error("Claim reward error:", error);
      setClaimStatus("error");
      alert(`❌ Error: ${error.message || "Unknown error"}`);
    } finally {
      setClaimStatus("idle");
    }
  };

  const backgroundVideo = playerData.isReclaimed
    ? landInfo?.reclaimedVideo
    : landInfo?.video;

  if (!isInitialized || !playerData.landKey) {
    return <div style={{ background: "black", height: "100vh", width: "100vw" }} />;
  }

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        color: "white",
        textAlign: "center",
      }}
    >
      {/* 🎬 Видео участка */}
      <video
        key={backgroundVideo}
        autoPlay
        muted
        loop
        playsInline
        src={backgroundVideo || "/desert.mp4"}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0, // Исправлено: видео под слоями
        }}
      />

      {/* 🌍 Интерфейс поверх видео */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "rgba(0,0,0,0.3)",
        }}
      >
        <h2 style={{ textShadow: "0 0 10px black" }}>
          🪐 Your Plot: {landInfo?.name}
        </h2>

        {!playerData.isReclaimed && !isReclaiming && (
          <button onClick={handleStartReclamation} style={btnStyles}>
            🚀 Start Reclamation
          </button>
        )}

        {isReclaiming && (
          <h3 style={{ marginTop: "20px" }}>♻️ Reclaiming... {timer}s</h3>
        )}

        {playerData.isReclaimed && !playerData.rewardClaimed && (
          <button
            onClick={handleClaimReward}
            disabled={claimStatus === "loading"}
            style={{
              ...btnStyles,
              backgroundColor: "#ffd700",
              opacity: claimStatus === "loading" ? 0.7 : 1,
              cursor: claimStatus === "loading" ? "wait" : "pointer",
            }}
          >
            {claimStatus === "loading" ? "Claiming..." : "🌱 Claim Reward"}
          </button>
        )}

        {playerData.isReclaimed && playerData.rewardClaimed && (
          <h3
            style={{
              marginTop: "20px",
              color: "#00ff7f",
              textShadow: "0 0 10px black",
            }}
          >
            ✅ Land reclaimed, reward claimed!
          </h3>
        )}
      </div>

      {/* 💼 Кошелёк */}
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 3 }}>
        <WalletMultiButton />
      </div>
    </div>
  );
};

const btnStyles: React.CSSProperties = {
  marginTop: "20px",
  padding: "12px 24px",
  fontSize: "1.1rem",
  borderRadius: "8px",
  backgroundColor: "#00ff7f",
  color: "black",
  fontWeight: "bold",
  border: "none",
  cursor: "pointer",
  transition: "transform 0.2s ease",
};

export default MyLandPage;
