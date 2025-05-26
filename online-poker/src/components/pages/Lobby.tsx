import PlayerList from "../PlayersList";
import { useFirestoreFunctions } from "../../hooks/useFirestoreFunctions";
import { useNavigate, useParams } from "react-router";
import { useEffect } from "react";

const Lobby = () => {
  const { leaveGame, gameStart, watchGameState } = useFirestoreFunctions();
  const { gameId } = useParams();
  const navigate = useNavigate();

  const handleLeaveGame = async () => {
    await leaveGame();
  };

  const handleGameStart = async () => {
    if (gameId) {
      const result = await gameStart(gameId);
      if (result) {
        navigate(`/game/${gameId}`);
      }
    }
  };

  useEffect(() => {
    if (!gameId) {
      navigate(`/`);
    }
  }, [gameId, navigate]);

  useEffect(() => {
    if (gameId) {
      const unsub = watchGameState(gameId, async (state) => {
        if (state !== "Waiting") {
          navigate(`/game/${gameId}`);
        }
      });
      return () => unsub();
    }
  }, [navigate]);

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <button className="Leave-game-btn" onClick={handleLeaveGame}>
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
        <button className="Game-start-btn" onClick={handleGameStart}>
          Start Game
        </button>
      </div>
    </div>
  );
};
export default Lobby;
