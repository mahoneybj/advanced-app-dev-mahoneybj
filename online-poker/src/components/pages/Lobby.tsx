import PlayerList from "../PlayersList";
import { useGameStart } from "../../hooks/useGameStart";
import { useLeaveGame } from "../../hooks/useLeaveGame";
import { useNavigate, useParams } from "react-router";
import { useEffect } from "react";
import { useAuth } from "../../context/FirebaseAuthContext";
import { useGameDetails } from "../../context/GameContext";
import { useLoading } from "../../context/IsLoadingContext";


const Lobby = () => {
  const { leaveGame } = useLeaveGame();
  const { processGameStart } = useGameStart();
  const { gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { playerCount, gameState, gameID } = useGameDetails();
  const { isLoading } = useLoading();

  const handleLeaveGame = async () => {
    if (gameId && user?.uid) {
      await leaveGame(gameId, user.uid);
      navigate(`/`);
    }
  };

  const handleGameStart = async () => {
    if (gameId) {
      const result = await processGameStart(gameId);
      if (result) {
        navigate(`/game/${gameId}`);
      }
    }
  };

  useEffect(() => {
    if (gameID && gameState !== "Waiting") {
      navigate(`/game/${gameId}`);
    }
  }, [navigate, gameID, gameState]);

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <button className="Leave-game-btn" onClick={handleLeaveGame} disabled={isLoading}>
          Leave Game
        </button>
        <h1>Welcome to your poker lobby!</h1>
        <h3>
          Share your Game ID for friends to join:{" "}
          <span className="game-id">{gameId}</span>
        </h3>
      </div>
      <div className="players-list">
        <h3>Players</h3>
        <PlayerList gameID={gameId} />
      </div>
      <div className="game-start">
        {playerCount > 1 ? (
          <button className="Game-start-btn" onClick={handleGameStart} disabled={isLoading}>
            Start Game
          </button>
        ) : (
          <p className="waiting-message">Waiting for more players to join...</p>
        )}
      </div>
    </div>
  );
};
export default Lobby;
