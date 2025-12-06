import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";

export const RPC_URL = "https://api.devnet.solana.com"; // или http://127.0.0.1:8899 если локально
export const connection = new Connection(RPC_URL, "confirmed");

// Твой program ID (тот, что мы видели в solana address)
export const PROGRAM_ID = new PublicKey("2ZruFMPznDSMcTry1X4JemNDrA284jiy7mjWV7LW77Aw");

export function getAnchorProvider(wallet: any) {
  const provider = new anchor.AnchorProvider(connection, wallet, anchor.AnchorProvider.defaultOptions());
  anchor.setProvider(provider);
  return provider;
}

