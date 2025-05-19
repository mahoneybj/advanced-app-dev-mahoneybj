import { useFirestoreFunctions } from "../../hooks/useFirestoreFunctions";
import { useParams } from "react-router"
import { useEffect } from "react";
import CardsList from "../CardsList";

const Game = () => {
  const { getPlayerCards } = useFirestoreFunctions();
  const { gameId } = useParams<{ gameId: string }>();

  useEffect(() => {
    if (gameId) {
      const unsubscribe = getPlayerCards(gameId, (updatedCards) => {
        console.log("Cards updated:", updatedCards);
      });
      
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, []); 

  return (
    <div className="game">
      <h1>Game</h1>
      <p>Welcome to the game!</p>
      <CardsList />
    </div>
  );
};

export default Game;
