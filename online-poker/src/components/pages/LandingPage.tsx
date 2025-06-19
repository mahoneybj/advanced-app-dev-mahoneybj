import { useAuth } from "../../context/FirebaseAuthContext";
import { useNavigate } from "react-router";
import { useCreateGame } from "../../hooks/useCreateGame";
import { useGameJoin } from "../../hooks/useGameJoin";
import { useEffect, useState } from "react";
import { useLoading } from "../../context/IsLoadingContext";
import { useGameDetails } from "../../context/GameContext";

const LandingPage = () => {
  const { user } = useAuth();
  const { gameID, setGameID } = useGameDetails();
  const navigate = useNavigate();
  const { processGameJoin } = useGameJoin();
  const { processGameCreate } = useCreateGame();
  const { isLoading } = useLoading();
  const [gameIDInput, setGameIDInput] = useState("");

  // Calls processGameCreate hook to create a game and navigate to the lobby
  const handleCreateGame = async () => {
    if (!user) return;
    const result = await processGameCreate(user.uid);
    if (result) {
      const gameId = result.id;
      navigate(`/lobby/${gameId}`);
    }
  };

  // Calls processGameJoin hook to join a game and navigate to the lobby
  const handleJoinGame = async () => {
    if (!user) return;
    const result = await processGameJoin(gameIDInput);
    if (result) {
      setGameID(gameIDInput);
      navigate(`/lobby/${gameID}`);
    }
  };

  // Stops players navigatiing backwards so they use leave game button in lobby which resets context and removes them from game document
  useEffect(() => {
    if (gameID) {
      navigate(`/lobby/${gameID}`);
    }
  }, [gameID, navigate]);

  return (
    <section className="landing-page">
      <div className="landing-content">
        <h1>Poker</h1>
        <h3>Welcome, {user?.displayName}</h3>
        <div className="landing-description">
          <p>
            This is a poker game application where you can play poker with your
            friends.
          </p>
          <p>
            You can create a new game, join an existing game, and play poker
            with your friends.
          </p>
        </div>
        <div className="landing-actions">
          <button
            className="btn btn-primary"
            onClick={handleCreateGame}
            disabled={isLoading}
          >
            Create Game
          </button>
          <div className="join-actions">
            <input
              type="text"
              placeholder={"Enter Game ID"}
              value={gameIDInput}
              onChange={(e) => setGameIDInput(e.target.value)}
              disabled={isLoading}
            />
            <button
              className="btn btn-secondary"
              onClick={handleJoinGame}
              disabled={isLoading}
            >
              Join Game
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
export default LandingPage;
