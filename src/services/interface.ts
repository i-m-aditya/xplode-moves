// interfaces.ts - Anchor program interfaces and types

import * as anchor from "@coral-xyz/anchor";
import { Idl } from "@coral-xyz/anchor";

// Define the IDL type (must extend Idl)
export type XplodeMovesIDL = Idl;

// Define data types that match the Anchor program's structure
export type Coordinates = {
  x: number;
  y: number;
};

export type GameMove = {
  playerName: string;
  cell: Coordinates;
  timestamp: anchor.BN;
};

export type GameMoves = {
  gameId: string;
  gridSize: number;
  bombPositions: Coordinates[];
  moves: GameMove[];
};

// Define the program's API interface based on the IDL
export interface XplodeMovesProgram {
  account: {
    gameMoves: {
      fetch(address: anchor.web3.PublicKey): Promise<GameMoves>;
    };
  };
  methods: {
    initializeGame(
      gameId: string,
      gridSize: number,
      bombPositions: Coordinates[]
    ): {
      accounts(accounts: {
        gameMoves: anchor.web3.PublicKey;
        gameServer: anchor.web3.PublicKey;
        systemProgram: anchor.web3.PublicKey;
      }): {
        transaction(): Promise<anchor.web3.Transaction>;
      };
    };

    recordMove(
      playerName: string,
      cell: Coordinates
    ): {
      accounts(accounts: {
        gameMoves: anchor.web3.PublicKey;
        gameServer: anchor.web3.PublicKey;
      }): {
        transaction(): Promise<anchor.web3.Transaction>;
      };
    };

    delegateGame(gameId: string): {
      accounts(accounts: {
        pda: anchor.web3.PublicKey;
        gameServer: anchor.web3.PublicKey;
        bufferPda?: anchor.web3.PublicKey;
        delegationRecordPda?: anchor.web3.PublicKey;
        delegationMetadataPda?: anchor.web3.PublicKey;
        ownerProgram?: anchor.web3.PublicKey;
        delegationProgram?: anchor.web3.PublicKey;
        systemProgram?: anchor.web3.PublicKey;
      }): {
        transaction(): Promise<anchor.web3.Transaction>;
      };
    };

    commitAndUndelegateGame(): {
      accounts(accounts: {
        gameMoves: anchor.web3.PublicKey;
        gameServer: anchor.web3.PublicKey;
        magicProgram?: anchor.web3.PublicKey;
        magicContext?: anchor.web3.PublicKey;
      }): {
        transaction(): Promise<anchor.web3.Transaction>;
      };
    };

    commitGame(): {
      accounts(accounts: {
        gameMoves: anchor.web3.PublicKey;
        gameServer: anchor.web3.PublicKey;
        magicProgram?: anchor.web3.PublicKey;
        magicContext?: anchor.web3.PublicKey;
      }): {
        transaction(): Promise<anchor.web3.Transaction>;
      };
    };
  };
}
