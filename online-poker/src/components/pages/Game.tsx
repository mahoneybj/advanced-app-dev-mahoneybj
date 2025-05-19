import { useGameDetails } from "../../context/GameContext";
import { useFirestoreFunctions } from "../../hooks/useFirestoreFunctions";
import { useEffect } from "react";
import CardsList from "../CardsList";

const Game = () => {
  const { gameID, gameState } = useGameDetails();
  const { getPlayerCards } = useFirestoreFunctions();

  useEffect(() => {
    const loadPlayerCards = async () => {
      await getPlayerCards();
    };

    loadPlayerCards();
  }, [getPlayerCards]);

  return (
    <div className="game">
      <h1>Game</h1>
      <p>Welcome to the game!</p>
      <CardsList />
    </div>
  );
};

export default Game;
