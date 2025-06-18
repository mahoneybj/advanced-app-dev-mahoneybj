import { createContext, useContext, useState, ReactNode } from "react";

interface GameContextProps {
  gameID: string;
  gameState: string;
  cards: string[];
  turn: boolean;
  winnerName: string;
  winnerID: string;
  gameEnded: boolean;
  playerCount: number;
  setPlayerCount: (count: number) => void;
  setGameID: (gameID: string) => void;
  setGameState: (gameState: string) => void;
  setCards: (cards: string[]) => void;
  setTurn: (turn: boolean) => void;
  setWinnerName: (winnerName: string) => void;
  setWinnerID: (winnerID: string) => void;
  setGameEnded: (gameEnded: boolean) => void;
  resetGame: () => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameID, setGameID] = useState<string>("");
  const [gameState, setGameState] = useState<string>("waiting");
  const [cards, setCards] = useState<string[]>([]);
  const [turn, setTurn] = useState<boolean>(false);
  const [winnerName, setWinnerName] = useState<string>("");
  const [winnerID, setWinnerID] = useState<string>("");
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [playerCount, setPlayerCount] = useState<number>(0);

  const resetGame = () => {
    setGameID("");
    setGameState("waiting");
    setCards([]);
    setTurn(false);
    setWinnerName("");
    setWinnerID("");
    setGameEnded(false);
    setPlayerCount(0);
  };

  return (
    <GameContext.Provider
      value={{
        gameID,
        gameState,
        cards,
        turn,
        winnerName,
        winnerID,
        gameEnded,
        playerCount,
        setGameID,
        setGameState,
        setCards,
        setTurn,
        setWinnerName,
        setWinnerID,
        setGameEnded,
        setPlayerCount,
        resetGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameDetails = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGameDetails must be used within a GameProvider");
  }
  return context;
};
