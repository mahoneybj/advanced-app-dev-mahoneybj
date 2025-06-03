import { FieldValue } from "firebase/firestore";

export interface GameData {
  ownerUID: string;
  deck: string[];
  deckIndex: number;
  gameState: string;
  currentTurn: string;
  turnOrder: string[];
  turnIndex: number;
  playerCount: number;
}

// This type allows FieldValue for update operations
export interface GameDataUpdate {
  ownerUID?: string;
  deck?: string[];
  deckIndex?: number;
  gameState?: string;
  currentTurn?: string;
  turnOrder?: string[];
  turnIndex?: number;
  playerCount?: number | FieldValue;
}

export interface GameDataForTurn {
  deck: string[];
  deckIndex: number;
  turnOrder: string[];
  turnIndex: number;
  playerCount: number;
}

export interface Member {
  id: string;
  displayName: string;
  cards?: string[];
  isHost?: boolean;
}
