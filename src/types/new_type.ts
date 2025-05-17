/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/xplode_moves.json`.
 */
export type XplodeMoves = {
  address: "7oEVduKtpfgYQYPWCdZoCYYwPp41Qeh2DJd3qZ7mWZaB";
  metadata: {
    name: "xplodeMoves";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "commitAndUndelegateGame";
      docs: ["Commit and undelegate the game from ephemeral rollup"];
      discriminator: [109, 99, 188, 9, 198, 44, 89, 151];
      accounts: [
        {
          name: "gameServer";
          writable: true;
          signer: true;
        },
        {
          name: "gameMoves";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 97, 109, 101, 45, 112, 100, 97];
              },
              {
                kind: "account";
                path: "game_moves.game_id";
                account: "gameMoves";
              }
            ];
          };
        },
        {
          name: "magicProgram";
          address: "Magic11111111111111111111111111111111111111";
        },
        {
          name: "magicContext";
          writable: true;
          address: "MagicContext1111111111111111111111111111111";
        }
      ];
      args: [];
    },
    {
      name: "commitGame";
      docs: ["Manual commit the game state to base layer"];
      discriminator: [212, 148, 56, 92, 60, 28, 179, 66];
      accounts: [
        {
          name: "gameServer";
          writable: true;
          signer: true;
        },
        {
          name: "gameMoves";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 97, 109, 101, 45, 112, 100, 97];
              },
              {
                kind: "account";
                path: "game_moves.game_id";
                account: "gameMoves";
              }
            ];
          };
        },
        {
          name: "magicProgram";
          address: "Magic11111111111111111111111111111111111111";
        },
        {
          name: "magicContext";
          writable: true;
          address: "MagicContext1111111111111111111111111111111";
        }
      ];
      args: [];
    },
    {
      name: "delegateGame";
      docs: ["Delegate the game PDA to the ephemeral rollup"];
      discriminator: [116, 183, 70, 107, 112, 223, 122, 210];
      accounts: [
        {
          name: "gameServer";
          writable: true;
          signer: true;
        },
        {
          name: "bufferPda";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [98, 117, 102, 102, 101, 114];
              },
              {
                kind: "account";
                path: "pda";
              }
            ];
            program: {
              kind: "const";
              value: [
                100,
                254,
                24,
                159,
                112,
                125,
                189,
                222,
                171,
                254,
                87,
                144,
                33,
                147,
                194,
                187,
                74,
                19,
                179,
                67,
                164,
                108,
                167,
                164,
                252,
                200,
                100,
                224,
                97,
                210,
                193,
                12
              ];
            };
          };
        },
        {
          name: "delegationRecordPda";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [100, 101, 108, 101, 103, 97, 116, 105, 111, 110];
              },
              {
                kind: "account";
                path: "pda";
              }
            ];
            program: {
              kind: "account";
              path: "delegationProgram";
            };
          };
        },
        {
          name: "delegationMetadataPda";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  100,
                  101,
                  108,
                  101,
                  103,
                  97,
                  116,
                  105,
                  111,
                  110,
                  45,
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ];
              },
              {
                kind: "account";
                path: "pda";
              }
            ];
            program: {
              kind: "account";
              path: "delegationProgram";
            };
          };
        },
        {
          name: "pda";
          docs: ["CHECK The pda to delegate"];
          writable: true;
        },
        {
          name: "ownerProgram";
          address: "7oEVduKtpfgYQYPWCdZoCYYwPp41Qeh2DJd3qZ7mWZaB";
        },
        {
          name: "delegationProgram";
          address: "DELeGGvXpWV2fqJUhqcF5ZSYMS4JTLjteaAMARRSaeSh";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "gameId";
          type: "string";
        }
      ];
    },
    {
      name: "initializeGame";
      discriminator: [44, 62, 102, 247, 126, 208, 130, 215];
      accounts: [
        {
          name: "gameMoves";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 97, 109, 101, 45, 112, 100, 97];
              },
              {
                kind: "arg";
                path: "gameId";
              }
            ];
          };
        },
        {
          name: "gameServer";
          writable: true;
          signer: true;
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [
        {
          name: "gameId";
          type: "string";
        },
        {
          name: "gridSize";
          type: "u8";
        },
        {
          name: "bombPositions";
          type: {
            vec: {
              defined: {
                name: "coordinates";
              };
            };
          };
        }
      ];
    },
    {
      name: "processUndelegation";
      discriminator: [196, 28, 41, 206, 48, 37, 51, 167];
      accounts: [
        {
          name: "baseAccount";
          writable: true;
        },
        {
          name: "buffer";
        },
        {
          name: "payer";
          writable: true;
        },
        {
          name: "systemProgram";
        }
      ];
      args: [
        {
          name: "accountSeeds";
          type: {
            vec: "bytes";
          };
        }
      ];
    },
    {
      name: "recordMove";
      discriminator: [111, 244, 88, 207, 200, 48, 59, 2];
      accounts: [
        {
          name: "gameMoves";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [103, 97, 109, 101, 45, 112, 100, 97];
              },
              {
                kind: "account";
                path: "game_moves.game_id";
                account: "gameMoves";
              }
            ];
          };
        },
        {
          name: "gameServer";
          writable: true;
          signer: true;
        }
      ];
      args: [
        {
          name: "playerName";
          type: "string";
        },
        {
          name: "cell";
          type: {
            defined: {
              name: "coordinates";
            };
          };
        }
      ];
    }
  ];
  accounts: [
    {
      name: "gameMoves";
      discriminator: [210, 83, 181, 129, 143, 142, 163, 165];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "invalidCell";
      msg: "Invalid cell coordinates";
    },
    {
      code: 6001;
      name: "invalidGridSize";
      msg: "Invalid grid size - must be <= 5";
    }
  ];
  types: [
    {
      name: "coordinates";
      type: {
        kind: "struct";
        fields: [
          {
            name: "x";
            type: "u8";
          },
          {
            name: "y";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "gameMoves";
      type: {
        kind: "struct";
        fields: [
          {
            name: "gameId";
            type: "string";
          },
          {
            name: "gridSize";
            type: "u8";
          },
          {
            name: "bombPositions";
            type: {
              vec: {
                defined: {
                  name: "coordinates";
                };
              };
            };
          },
          {
            name: "moves";
            type: {
              vec: {
                defined: {
                  name: "move";
                };
              };
            };
          }
        ];
      };
    },
    {
      name: "move";
      type: {
        kind: "struct";
        fields: [
          {
            name: "playerName";
            type: "string";
          },
          {
            name: "cell";
            type: {
              defined: {
                name: "coordinates";
              };
            };
          },
          {
            name: "timestamp";
            type: "i64";
          }
        ];
      };
    }
  ];
};
