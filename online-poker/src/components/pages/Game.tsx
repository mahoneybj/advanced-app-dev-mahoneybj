import { useFirestoreFunctions } from "../../hooks/useFirestoreFunctions";
import { useGameDetails } from "../../context/GameContext";
import { useAuth } from "../../context/FirebaseAuthContext";
import { useParams, useNavigate } from "react-router";
import { useEffect } from "react";
import CardsList from "../CardsList";
import toast from "react-hot-toast";

const Game = () => {
  const { watchGameDetails, watchGameMembers } = useFirestoreFunctions();
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState, gameEnded } = useGameDetails();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (gameId && user) {
      const unsubscribe = watchGameMembers(gameId, () => {});
      const unsubscribeGameState = watchGameDetails(gameId, () => {});
      const unsubscribeGameTurn = watchGameDetails(gameId, () => {});

      return () => {
        if (unsubscribe) unsubscribe();
        if (unsubscribeGameState) unsubscribeGameState();
        if (unsubscribeGameTurn) unsubscribeGameTurn();
      };
    }
  }, []);

  useEffect(() => {
    if (gameEnded) {
      toast("Calculating winner 🏅", { icon: "🧐" });
      const timer = setTimeout(() => {
        navigate(`/winner`); 
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [gameEnded, navigate]);

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
