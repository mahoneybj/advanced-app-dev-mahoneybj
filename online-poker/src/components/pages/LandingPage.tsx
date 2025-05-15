import { useAuth } from "../../context/FirebaseAuthContext";
import { useNavigate } from "react-router"; 
import { useFirestoreFunctions } from "../../hooks/useFirestoreFunctions";
import { useEffect, useState } from "react";
import { useLoading } from "../../context/IsLoadingContext";
import { useGameDetails } from "../../context/GameContext";

const LandingPage = () => {
  const { user } = useAuth();
  const { gameID, setGameID } = useGameDetails();
  const navigate = useNavigate();
  const { createGame, joinGame } = useFirestoreFunctions();
  const { isLoading } = useLoading();
  const [gameIDInput, setGameIDInput] = useState("");


  const handleCreateGame = async () => {
    if (!user) return;
    const result = await createGame(user.uid);
    if (result) {
      const gameId = result.id;
      navigate(`/lobby/${gameId}`);
    }
  };

  const handleJoinGame = async () => {
    if (!user) return;
    const result = await joinGame(gameIDInput);
    if (result){
      setGameID(gameIDInput);
      navigate(`/lobby/${gameID}`);
    }

  }

  useEffect(() => {
    if(gameID) {
      navigate(`/lobby/${gameID}`);
    }
  }
  , [gameID, navigate]);


  return (
    <section className="landing-page">
      <div className="landing-content">
        <h1>Poker</h1>
        <h3>Welcome {user?.isAnonymous ? "Anonymous" : user?.displayName || "User"}</h3>
        <div className="landing-description">
          <p>
            This is a poker game application where you can play poker with your friends.
          </p>
          <p>
            You can create a new game, join an existing game, and play poker with your friends.
          </p>
        </div>
        <div className="landing-actions">
          <button className="btn btn-primary" onClick={handleCreateGame}>Create Game</button>
        <div className="join-actions">
        <input
          type="text"
          placeholder={"Enter Game ID"}
          value={gameIDInput}
          onChange={(e) => setGameIDInput(e.target.value)}
          disabled={isLoading}
        />
          <button className="btn btn-secondary" onClick={handleJoinGame}>Join Game</button>
        </div>
        </div>
      </div>
    </section>
  );
}
export default LandingPage;