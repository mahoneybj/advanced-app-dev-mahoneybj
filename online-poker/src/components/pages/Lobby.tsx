import PlayerList from "../PlayersList";
import { useFirestoreFunctions } from "../../hooks/useFirestoreFunctions";
import { useGameDetails } from "../../context/GameContext";
import { useNavigate } from "react-router";
import { useEffect } from "react";

const Lobby = () => {
  const { leaveGame, gameStart, watchGameState } = useFirestoreFunctions();
  const { gameID } = useGameDetails();
  const navigate = useNavigate();

  const handleLeaveGame = async () => {
    await leaveGame();
  };

  const handleGameStart = async () => {
    const result = await gameStart();
    if (result) {
      navigate(`/game/${gameID}`);
    }
  };

  useEffect(() => {
    if (!gameID) {
      navigate(`/`);
    }
  }, [gameID, navigate]);

  useEffect(() => {
    const unsub = watchGameState(async (state) => {
      if (state === "playing") {
        navigate(`/game/${gameID}`);
      }
    });
    return () => unsub();
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
          <span className="game-id">{gameID}</span>
        </h3>
      </div>
      <div className="players-list">
        <h3>Players</h3>
        <PlayerList gameID={gameID} />
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
