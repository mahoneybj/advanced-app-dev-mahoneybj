import { useFirestoreFunctions } from "../../hooks/useFirestoreFunctions";
import { useGameDetails } from "../../context/GameContext";
import { useParams } from "react-router";
import { useEffect } from "react";
import CardsList from "../CardsList";

const Game = () => {
  const { getPlayerCards, getGameState } = useFirestoreFunctions();
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState } = useGameDetails();

  useEffect(() => {
    if (gameId) {
      const unsubscribe = getPlayerCards(gameId, (updatedCards) => {
        console.log("Cards updated:", updatedCards);
      });
      const unsubscribeGameState = getGameState(gameId, (state) => {
        console.log("Game state updated:", state);
      });

      return () => {
        if (unsubscribe) unsubscribe();
        if (unsubscribeGameState) unsubscribeGameState();
      };
    }
  }, []);

  return (
    <div className="game">
      <h1>Game</h1>
      <div className="Game-state">
        <h3>Game state: {gameState}</h3>
      </div>
      <div className="Cards-Container">
        <CardsList />
      </div>
    </div>
  );
};

export default Game;
