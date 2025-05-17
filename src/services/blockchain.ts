import * as anchor from "@coral-xyz/anchor";
import { Program, Idl } from "@coral-xyz/anchor";
import { InitializeGameRequest, RecordMoveRequest } from "../types";
// import { logger } from "../utils/logger";
import { Keypair } from "@solana/web3.js";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import idl from "../types/new_idl.json";
import type { XplodeMoves } from "../types/new_type";
// import { GetCommitmentSignature } from "@magicblock-labs/ephemeral-rollups-sdk";

export class BlockchainService {
  private program: Program<XplodeMoves>;
  private baseProvider: anchor.AnchorProvider;
  private erProvider: anchor.AnchorProvider;
  private pdaCache: Map<string, anchor.web3.PublicKey>;

  constructor() {
    // Read keypair from xplode-moves-keypair.json
    const configPath = path.join(process.cwd(), "xplode-moves-keypair.json");
    const keypairData = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    const wallet = new anchor.Wallet(
      Keypair.fromSecretKey(new Uint8Array(keypairData))
    );

    // Initialize base provider with hardcoded values
    const baseConnection = new anchor.web3.Connection(
      "https://devnet.helius-rpc.com/?api-key=186936b3-1829-4bc5-a670-eb2753b29a3a"
    );
    this.baseProvider = new anchor.AnchorProvider(baseConnection, wallet, {
      commitment: "confirmed",
    });
    // // Initialize base provider with hardcoded values
    // const baseConnection = new anchor.web3.Connection(
    //   "https://api.devnet.solana.com"
    // );
    // this.baseProvider = new anchor.AnchorProvider(baseConnection, wallet, {
    //   commitment: "confirmed",
    // });

    // // Initialize ER provider with hardcoded values
    // const erConnection = new anchor.web3.Connection("http://localhost:8899", {
    //   wsEndpoint: "ws://localhost:8900",
    // });

    // Initialize ER provider with hardcoded values
    const erConnection = new anchor.web3.Connection(
      "https://devnet.magicblock.app/",
      {
        wsEndpoint: "wss://devnet.magicblock.app/",
      }
    );
    // // Initialize ER provider with hardcoded values
    // const erConnection = new anchor.web3.Connection("http://3.88.219.64:8899", {
    //   wsEndpoint: "ws://3.88.219.64:8900",
    // });
    this.erProvider = new anchor.AnchorProvider(erConnection, wallet);
    this.program = new Program(idl as XplodeMoves, this.baseProvider);

    // Debug logs for program initialization
    console.log("Program ID:", this.program.programId.toString());
    console.log(
      "Available program methods:",
      Object.keys(this.program.methods)
    );

    // Initialize PDA cache
    this.pdaCache = new Map();
  }

  getProgramId(): anchor.web3.PublicKey {
    return this.program.programId;
  }

  async getGameAccount(pda: anchor.web3.PublicKey) {
    return await this.program.account.gameMoves.fetch(pda);
  }

  private async getGamePda(gameId: string): Promise<anchor.web3.PublicKey> {
    // Check cache first
    const cachedPda = this.pdaCache.get(gameId);
    if (cachedPda) {
      return cachedPda;
    }

    // Compute and cache PDA
    const [pda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("game-pda"), Buffer.from(gameId)],
      this.program.programId
    );
    console.log("PDA derivation details:");
    console.log("  Program ID:", this.program.programId.toString());
    console.log("  Game ID:", gameId);
    console.log("  Derived PDA:", pda.toString());
    this.pdaCache.set(gameId, pda);
    return pda;
  }

  async initializeGame(request: InitializeGameRequest): Promise<string> {
    try {
      console.log("Initialize game request:", request);
      // Ensure game_id is exactly 32 bytes by truncating if longer and padding if shorter
      const paddedGameId = request.gameId.slice(0, 32).padEnd(32, " ");
      const gameMovesPda = await this.getGamePda(paddedGameId);

      // Create and sign initialization transaction
      let initTx = await this.program.methods
        .initializeGame(paddedGameId, request.gridSize, request.bombPositions)
        .accounts({
          //@ts-ignore
          gameMoves: gameMovesPda,
          gameServer: this.baseProvider.wallet.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .transaction();

      initTx.feePayer = this.baseProvider.wallet.publicKey;
      initTx.recentBlockhash = (
        await this.baseProvider.connection.getLatestBlockhash()
      ).blockhash;

      console.log("Sending and confirming transaction");
      try {
        // Get the keypair from the wallet
        const keypair = Keypair.fromSecretKey(
          new Uint8Array(
            JSON.parse(
              fs.readFileSync(
                path.join(process.cwd(), "xplode-moves-keypair.json"),
                "utf-8"
              )
            )
          )
        );

        // Sign and send transaction
        const initTxHash = await this.baseProvider.sendAndConfirm(
          initTx,
          [keypair],
          {
            skipPreflight: true,
            maxRetries: 3,
            commitment: "confirmed",
          }
        );
        console.log("Transaction confirmed, hash:", initTxHash);

        // Delegate to ER
        console.log("Starting delegation process...");
        const delegateTxHash = await this.delegateGame(paddedGameId);
        console.log("Delegation completed, hash:", delegateTxHash);

        return initTxHash;
      } catch (error) {
        console.error("Detailed error:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error initializing game:", error);
      throw error;
    }
  }

  async recordMove(request: RecordMoveRequest): Promise<string> {
    try {
      console.log("Record move request:", request);
      const paddedGameId = request.gameId.slice(0, 32).padEnd(32, " ");
      const gameMovesPda = await this.getGamePda(paddedGameId);

      // Create and sign move transaction
      let moveTx = await this.program.methods
        .recordMove(request.playerName, request.cell)
        .accounts({
          //@ts-ignore
          gameMoves: gameMovesPda,
          gameServer: this.erProvider.wallet.publicKey,
        })
        .transaction();

      moveTx.feePayer = this.erProvider.wallet.publicKey;
      moveTx.recentBlockhash = (
        await this.erProvider.connection.getLatestBlockhash("processed")
      ).blockhash;
      moveTx = await this.erProvider.wallet.signTransaction(moveTx);

      const moveTxHash = await this.erProvider.sendAndConfirm(moveTx, [], {
        skipPreflight: true,
        maxRetries: 3,
        commitment: "processed",
      });

      //   // Wait for move to be committed to base layer
      //   console.log("Waiting for move to be committed to base layer...");
      //   await new Promise((resolve) => setTimeout(resolve, 10000));

      //   // Verify move was recorded
      //   try {
      //     const gameAccount = await this.program.account.gameMoves.fetch(
      //       gameMovesPda,
      //       "processed"
      //     );
      //     if (!gameAccount.moves || gameAccount.moves.length === 0) {
      //       throw new Error("No moves found in game account");
      //     }

      //     console.log("Game moves:", gameAccount.moves.length);

      //     console.log("Game account:", gameAccount);

      //     // const lastMove = gameAccount.moves[gameAccount.moves.length - 1];
      //     // if (
      //     //   lastMove.playerName !== request.playerName ||
      //     //   lastMove.cell.x !== request.cell.x ||
      //     //   lastMove.cell.y !== request.cell.y
      //     // ) {
      //     //   throw new Error(
      //     //     "Move verification failed - move details don't match"
      //     //   );
      //     // }

      //     // console.log("Move verified successfully:", {
      //     //   playerName: lastMove.playerName,
      //     //   cell: lastMove.cell,
      //     //   totalMoves: gameAccount.moves.length,
      //     // });
      //   } catch (err: any) {
      //     console.error("Move verification failed:", err);
      //     throw new Error(`Move verification failed: ${err.message}`);
      //   }

      return moveTxHash;
    } catch (error) {
      console.error("Error recording move:", error);
      throw error;
    }
  }

  private async delegateGame(gameId: string): Promise<string> {
    try {
      const gameMovesPda = await this.getGamePda(gameId);

      // Create and sign delegation transaction
      let delegateTx = await this.program.methods
        .delegateGame(gameId)
        .accounts({
          pda: gameMovesPda,
          gameServer: this.baseProvider.wallet.publicKey,
        })
        .transaction();

      delegateTx.feePayer = this.baseProvider.wallet.publicKey;
      delegateTx.recentBlockhash = (
        await this.baseProvider.connection.getLatestBlockhash()
      ).blockhash;
      delegateTx = await this.erProvider.wallet.signTransaction(delegateTx);

      const delegateTxHash = await this.baseProvider.sendAndConfirm(
        delegateTx,
        [],
        {
          skipPreflight: true,
          commitment: "confirmed",
          maxRetries: 3,
        }
      );

      return delegateTxHash;
    } catch (error) {
      console.error("Error delegating game:", error);
      throw error;
    }
  }

  async commitAndUndelegate(gameId: string): Promise<string> {
    try {
      const paddedGameId = gameId.slice(0, 32).padEnd(32, " ");
      const gameMovesPda = await this.getGamePda(paddedGameId);

      // Create and sign commit transaction
      let commitTx = await this.program.methods
        .commitAndUndelegateGame()
        .accounts({
          //@ts-ignore
          gameMoves: gameMovesPda,
          gameServer: this.erProvider.wallet.publicKey,
        })
        .transaction();

      commitTx.feePayer = this.erProvider.wallet.publicKey;
      commitTx.recentBlockhash = (
        await this.erProvider.connection.getLatestBlockhash("processed")
      ).blockhash;
      commitTx = await this.erProvider.wallet.signTransaction(commitTx);

      const commitTxHash = await this.erProvider.sendAndConfirm(commitTx, [], {
        skipPreflight: true,
        maxRetries: 3,
        commitment: "processed",
      });

      //   // // Wait longer for transaction to be processed
      //   // console.log("Waiting for transaction to be processed (5s)...");
      //   // await sleep(5000);

      //   try {
      //     // Try to get the commitment signature
      //     const commitSignature = await GetCommitmentSignature(
      //       commitTxHash,
      //       this.erProvider.connection
      //     );
      //     console.log("Commitment signature:", commitSignature);
      //   } catch (err: any) {
      //     console.warn("Could not get commitment signature:", err.message);
      //     console.log("This is not critical - continuing with test...");
      //   }

      return commitTxHash;
    } catch (error) {
      console.error("Error committing and undeleting game:", error);
      throw error;
    }
  }
}
