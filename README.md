# 🌿 Sylvan: Play-to-Reclaim on Solana

**The first deflationary strategy game where players heal the planet to earn.**
*Built by a Solo Dev. No VCs. 100% On-Chain Economy.*

![License](https://img.shields.io/badge/license-MIT-green)
![Network](https://img.shields.io/badge/network-Solana-blueviolet)
![Status](https://img.shields.io/badge/status-MVP_Live-success)

## 📜 About The Project

Sylvan is a GameFi experiment designed to solve the "Death Spiral" of P2E economies. Instead of infinite inflation, we introduce **Mortal Assets**.
Every Land plot decays over time. Players must burn tokens (Resources) to maintain their yield.

**Core Loop:**
1.  **Reclaim:** Activate dead lands.
2.  **Heal:** Burn tokens to restore "Health Bar".
3.  **Harvest:** Earn yield only from healthy lands.

## 🛠 Tech Stack

This project is built using the **Solana Anchor Framework**.

*   **Smart Contracts:** Rust (Anchor)
*   **Frontend:** Next.js / TypeScript
*   **Integration:** Solana Wallet Adapter (Phantom/Solflare)
*   **Testing:** Mocha / Chai

  ## 🔒 Security & Audit
* This is currently an MVP / Pre-Alpha build running on Testnet.
* Formal audit is scheduled post-fundraise.
* Use at your own risk during the testing phase.

## 🔗 Official Links
* Twitter: @SergeySylvan
* Discord: discord.gg/W3JB67Tcf3
* Mint Page: indie.fun/sylvan

## 📂 Repository Structure

*   `/programs` - The core Solana smart contracts (The logic of Mortal Lands).
*   `/sylvan_front` - The React-based frontend for interacting with the game.
*   `/tests` - Unit tests for the "Reclaim" mechanics.
*   `/migrations` - Deploy scripts for Devnet/Mainnet.

## 🚀 Getting Started (Devnet)

To run the MVP locally:

```bash
# Install dependencies
yarn install

# Build the Anchor program
anchor build

# Run tests
anchor test

