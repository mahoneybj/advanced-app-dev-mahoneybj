// Intfaces for gameData and members to stop code repition in hooks
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

export interface Member {
  id: string;
  displayName: string;
  cards?: string[];
  isHost?: boolean;
}
