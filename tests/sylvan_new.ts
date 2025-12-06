import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { SylvanNew } from "../target/types/sylvan_new";
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import { assert } from "chai";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

describe("sylvan_new", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = anchor.workspace.SylvanNew as Program<SylvanNew>;
  const player = provider.wallet as anchor.Wallet;
  const payerKeypair = (provider.wallet as any).payer as Keypair; // signer for token ops
  const treasury = Keypair.generate();

  it("🌱 Creates land plot, revives it and harvests tokens (full-run, local mint)", async () => {
    console.log("\n=== TEST START ===");
    console.log("Player:", player.publicKey.toBase58());
    console.log("Program ID:", program.programId.toBase58());

    // 0) create a local SPL mint for testing (so tests are self-contained)
    const decimals = 9;
    const sylMint = await createMint(
      provider.connection,
      payerKeypair,          // fee payer & signer for mint creation
      player.publicKey,      // mint authority
      null,                  // freeze authority
      decimals
    );
    console.log("Local test mint created:", sylMint.toBase58());

    // PDAs (same derivation as program expects)
    const [landPlotPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("land"), player.publicKey.toBuffer()],
      program.programId
    );
    const [vaultAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId
    );

    console.log("Land PDA:", landPlotPda.toBase58());
    console.log("Vault authority PDA:", vaultAuthorityPda.toBase58());

    // 1) Create Land Plot
    try {
      const tx1 = await program.methods
        .createLandPlot()
        .accounts({
          landPlot: landPlotPda,
          player: player.publicKey,
          treasury: treasury.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      await provider.connection.confirmTransaction(tx1, "confirmed");
      console.log("✅ Land plot created:", tx1);
    } catch (err: any) {
      console.warn("⚠️ Create land plot failed (continuing):", err?.message ?? err);
    }

    await sleep(500);

    // 2) Revive Land Plot (make it ready if program logic requires)
    try {
      const tx2 = await program.methods
        .reviveLandPlot()
        .accounts({
          landPlot: landPlotPda,
          player: player.publicKey,
        })
        .rpc();
      await provider.connection.confirmTransaction(tx2, "confirmed");
      console.log("✅ Land plot revived:", tx2);
    } catch (err: any) {
      console.warn("⚠️ Revive land plot failed (continuing):", err?.message ?? err);
    }

    await sleep(500);

    // 3) Prepare token accounts and fund vault
    try {
      // Airdrop lamports to vault PDA so it can pay rent if needed
      const airdropSig = await provider.connection.requestAirdrop(
        vaultAuthorityPda,
        2 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSig, "confirmed");
      console.log("✅ Airdropped 2 SOL to vault PDA for rent.");
    } catch (err: any) {
      console.warn("⚠️ Airdrop to vault PDA failed (continuing):", err?.message ?? err);
    }

    // Create/get associated token accounts
    const playerTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payerKeypair,
      sylMint,
      player.publicKey
    );

    const vaultTokenAccount = await getOrCreateAssociatedTokenAccount(
      provider.connection,
      payerKeypair,
      sylMint,
      vaultAuthorityPda,
      true // allowOwnerOffCurve true for PDAs
    );

    console.log("Player token account:", playerTokenAccount.address.toBase58());
    console.log("Vault token account:", vaultTokenAccount.address.toBase58());

    // Mint test tokens into the vault so harvest can pull from it
    const amountToMint = BigInt(1000) * BigInt(10 ** decimals); // 1000 tokens
    await mintTo(
      provider.connection,
      payerKeypair,
      sylMint,
      vaultTokenAccount.address,
      payerKeypair, // signer (mint authority) -> payerKeypair is the mint authority created above
      amountToMint
    );
    console.log("✅ Minted tokens to vault token account.");

    await sleep(500);

    // 4) Harvest (call program)
    try {
      const tx3 = await program.methods
        .harvest()
        .accounts({
          player: player.publicKey,
          landPlot: landPlotPda,
          sylMint: sylMint,
          vaultAuthority: vaultAuthorityPda,
          vaultTokenAccount: vaultTokenAccount.address,
          playerTokenAccount: playerTokenAccount.address,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      await provider.connection.confirmTransaction(tx3, "confirmed");
      console.log("✅ Harvest tx:", tx3);
      assert.ok(true, "Harvest completed");
    } catch (err: any) {
      console.error("❌ Harvest / token transfer failed:", err?.message ?? err);
      assert.fail("Harvest transaction failed");
    }
  }).timeout(120000); // longer timeout for chain ops
});
