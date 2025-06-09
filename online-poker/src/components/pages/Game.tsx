import { useFirestoreFunctions } from "../../hooks/useFirestoreFunctions";
import { useGameDetails } from "../../context/GameContext";
import { useAuth } from "../../context/FirebaseAuthContext";
import { useParams } from "react-router";
import { useEffect } from "react";
import CardsList from "../CardsList";

const Game = () => {
  const { watchGameDetails, watchGameMembers } = useFirestoreFunctions();
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState } = useGameDetails();
  const { user } = useAuth();

  useEffect(() => {
    if (gameId && user) {
      const unsubscribe = watchGameMembers(gameId, (updatedCards) => {
        console.log("Cards updated:", updatedCards);
      });
      const unsubscribeGameState = watchGameDetails(gameId, (state) => {
        console.log("Game state updated:", state);
      });
      const unsubscribeGameTurn = watchGameDetails(gameId, (turn) => {
        console.log("Game state updated:", turn);
      });

      return () => {
        if (unsubscribe) unsubscribe();
        if (unsubscribeGameState) unsubscribeGameState();
        if (unsubscribeGameTurn) unsubscribeGameTurn();
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
