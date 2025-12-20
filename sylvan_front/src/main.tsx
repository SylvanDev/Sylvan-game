// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

import App from "./App";
import LandsPage from "./pages/LandsPage";
import MyLandPage from "./pages/MyLandPage";
import Layout from "./Layout";

import "./index.css";
import "@solana/wallet-adapter-react-ui/styles.css";

// --- НАСТРОЙКИ СЕТИ ---
const network = WalletAdapterNetwork.Devnet;

// Твой Helius ключ (правильный)
const endpoint = "https://devnet.helius-rpc.com/?api-key=2a67d452-0b09-42fc-8594-661b31688352";

const wallets = [new PhantomWalletAdapter()];

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      {/* 👇 ВОТ ТУТ МЫ ОТКЛЮЧИЛИ АВТО-ПОДКЛЮЧЕНИЕ */}
      <WalletProvider wallets={wallets} autoConnect={false}>
        <WalletModalProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<App />} />
                <Route path="lands" element={<LandsPage />} />
                <Route path="my-land" element={<MyLandPage />} />
              </Route>
            </Routes>
          </Router>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);