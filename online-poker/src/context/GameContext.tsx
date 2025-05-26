import { createContext, useContext, useState, ReactNode } from "react";

interface GameContextProps {
  gameID: string;
  gameState: string;
  cards: string[];
  turn: string; 
  setGameID: (gameID: string) => void;
  setGameState: (gameState: string) => void;
  setCards: (cards: string[]) => void;
  setTurn: (turn: string) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameID, setGameID] = useState<string>("");
  const [gameState, setGameState] = useState<string>("waiting");
  const [cards, setCards] = useState<string[]>([]);
  const [turn, setTurn] = useState<string>("");

  return (
    <GameContext.Provider
      value={{ gameID, gameState, cards, turn, setGameID, setGameState, setCards, setTurn }}
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
