// src/main.tsx

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";

// Импортируем наши компоненты
import App from "./App"; // Это наша HomePage
import LandsPage from "./pages/LandsPage";
import MyLandPage from "./pages/MyLandPage";
import Layout from "./Layout"; // <-- Импортируем наш новый Layout

import "./index.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const network = WalletAdapterNetwork.Devnet;
const endpoint = "https://api.devnet.solana.com";
const wallets = [new PhantomWalletAdapter()];

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <Router>
            <Routes>
              {/* Мы создаем "родительский" маршрут, который использует Layout */}
              <Route path="/" element={<Layout />}>
                {/* А все дочерние страницы теперь будут отображаться внутри Outlet */}
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