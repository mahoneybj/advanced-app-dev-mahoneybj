import { createContext, useContext, useState, ReactNode } from "react";

interface GameContextProps {
  gameID: string;
  setGameID: (gameID: string) => void;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameID, setGameID] = useState<string>("");

  return (
    <GameContext.Provider value={{ gameID, setGameID }}>
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
