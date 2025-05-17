export interface Coordinates {
  x: number;
  y: number;
}

export interface InitializeGameRequest {
  gameId: string;
  gridSize: number;
  bombPositions: Coordinates[];
}

export interface RecordMoveRequest {
  gameId: string;
  playerName: string;
  cell: Coordinates;
}

export interface GameState {
  gameId: string;
  gridSize: number;
  bombPositions: Coordinates[];
  moves: Move[];
}

export interface Move {
  playerName: string;
  cell: Coordinates;
  timestamp: number;
}
