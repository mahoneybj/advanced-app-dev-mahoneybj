import { useGameDetails } from "../../context/GameContext";
import { useParams, useNavigate } from "react-router";
import { useEffect } from "react";
import CardsList from "../CardsList";
import toast from "react-hot-toast";

const Game = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { gameState, gameEnded } = useGameDetails();
  const navigate = useNavigate();

  // Navigates to winner page when game ends with a 5 second delay to allow players to see cards
  useEffect(() => {
    if (gameEnded) {
      toast("Calculating winner 🏅", { icon: "🧐" });
      const timer = setTimeout(() => {
        navigate(`/winner/${gameId}`);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [gameEnded, navigate]);

  return (
    <div className="game">
      <h1>Game</h1>
      <div className="Game-state">
        <h3>{gameState}</h3>
      </div>
      <div className="Cards-Container">
        <CardsList />
      </div>
    </div>
  );
};

export default Game;
