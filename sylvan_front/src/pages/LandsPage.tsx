// src/pages/LandsPage.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSylvanGameStore } from "../hooks/useSylvanGameStore";

import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  LAMPORTS_PER_SOL
} from "@solana/web3.js";

// Адрес вашей казны
const TREASURY_ADDRESS = new PublicKey("BMEhBwCvjB6yzHTYhbEktuBgc6VBq5utHq1fSpVALPKU");

// --- ИСПРАВЛЕНИЕ: Ставим прямой адрес Solana Devnet ---
const connection = new Connection("https://devnet.helius-rpc.com/?api-key=2a67d452-0b09-42fc-8594-661b31688352", "confirmed");
// -----------------------------------------------------

const LandsPage: React.FC = () => {
  const navigate = useNavigate();
  const { connected, publicKey, sendTransaction } = useWallet();
  const { isInitialized, playerData, buyLand } = useSylvanGameStore();

  const [isBuying, setIsBuying] = useState<string | null>(null);

  const backgroundVideo = "/infected_land.mp4";

  const lands = [
    {
      name: "🏜️ Wild Lands",
      desc: "A rare resource, stable farming.",
      priceSOL: 0.25,
      video: "/desert.mp4",
      key: "desert",
      enabled: true,
    },
    {
      name: "🌲 Forest Fracture",
      desc: "Fertile zone, quick to restore.",
      priceSOL: 0.5,
      video: "/forest.mp4",
      key: "forest",
      enabled: false,
    },
    {
      name: "⛰️ Mountain Plateau",
      desc: "Rare minerals and energy.",
      priceSOL: 1,
      video: "/plateau.mp4",
      key: "plateau",
      enabled: false,
    },
    {
      name: "🌊 Dark Waters",
      desc: "Bonus harvest and unique seeds.",
      priceSOL: 2,
      video: "/coast.mp4",
      key: "coast",
      enabled: false,
    },
  ];

  useEffect(() => {
    if (isInitialized && !connected) {
      navigate("/");
    }
  }, [connected, isInitialized, navigate]);

  useEffect(() => {
    if (isInitialized && playerData.landKey) {
      navigate("/my-land");
    }
  }, [isInitialized, playerData.landKey, navigate]);

  const handleBuy = async (landKey: string, priceSOL: number) => {
    if (!connected || !publicKey || !sendTransaction) {
      alert("Please connect your wallet first!");
      return;
    }

    setIsBuying(landKey);

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: TREASURY_ADDRESS,
          lamports: priceSOL * LAMPORTS_PER_SOL,
        })
      );

      transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
      transaction.feePayer = publicKey;

      const signature = await sendTransaction(transaction, connection);
      console.log("Transaction sent, signature:", signature);

      await connection.confirmTransaction(signature, "confirmed");
      console.log("Transaction confirmed!");

      buyLand(landKey);
      alert("Purchase successful! You are now a Sylvan Guardian.");

    } catch (error) {
      console.error("Purchase failed:", error);
      alert(`Purchase failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setIsBuying(null);
    }
  };

  if (!isInitialized) {
    return (
      <div style={{ background: "black", color: "#00ff99", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: "'OriginTech', sans-serif", fontSize: '1.2rem' }}>
        Loading Player Data...
      </div>
    );
  }

  return (
    <div style={{ position: "relative", height: "100vh", width: "100vw", overflow: "hidden" }}>
      <video autoPlay muted loop playsInline src={backgroundVideo} style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover" }}/>
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 2 }}>
        <WalletMultiButton />
      </div>

      <div style={{ position: "relative", zIndex: 1, color: "white", textAlign: "center", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
        <h2 style={{ fontSize: "1.8rem", marginBottom: "2rem" }}>
          🌍 Choose a plot on planet{" "}
          <span style={{ color: "#00ff7f" }}>SYLVAN</span>
        </h2>

        <div style={{ display: "flex", justifyContent: "center", gap: "1.5rem", flexWrap: "wrap", maxWidth: "1200px", padding: "1rem" }}>
          {lands.map((land) => {
            const isDisabled = !land.enabled;
            const isLoading = isBuying === land.key;
            return (
              <div key={land.key} style={{
                width: "260px",
                height: "220px",
                borderRadius: "12px",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0 0 10px rgba(0,0,0,0.8)",
                border: "1px solid rgba(255,255,255,0.15)",
                opacity: isDisabled ? 0.5 : 1
              }}>
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  src={land.video}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    filter: `grayscale(${isDisabled ? 0.8 : 0}) brightness(1.3)`,
                  }}
                />
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "rgba(0,0,0,0.5)", color: "white", padding: '12px' }}>
                  <h3>{land.name}</h3>
                  <p style={{ margin: '8px 0', fontSize: '0.9rem' }}>{land.desc}</p>
                  <p style={{ fontWeight: 'bold', fontSize: '1rem', margin: '8px 0' }}>{land.priceSOL} SOL</p>
                  <button
                    onClick={() => handleBuy(land.key, land.priceSOL)}
                    disabled={isDisabled || !!isBuying}
                    style={{
                      marginTop: "auto",
                      background: isDisabled ? "grey" : "linear-gradient(90deg, #00ff99, #00ccff)",
                      color: "black",
                      border: "none",
                      padding: "8px 18px",
                      borderRadius: "8px",
                      cursor: isDisabled ? "not-allowed" : "pointer",
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}
                  >
                    {isLoading ? "Processing..." : (isDisabled ? "🔒 Locked" : "🛒 Purchase")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LandsPage;