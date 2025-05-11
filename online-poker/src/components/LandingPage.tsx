import { useAuth } from "../context/FirebaseAuthContext";
import { useNavigate } from "react-router"; 
import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createGame, joinGame } = useFirestoreFunctions();


  const handleCreateGame = async () => {
    if (!user) return;
    
    try {
      const result = await createGame(user.uid);
      if (result) {
        const gameId = result.id;
        
        navigate(`/lobby/${gameId}`);
      }
    } catch (error) {
      console.error("Error creating game:", error);
    }
  };

  const handleJoinGame = () => {
    navigate("/join-game");
  };


  return (
    <section className="landing-page">
      <div className="landing-content">
        <h1>Poker</h1>
        <h2>Welcome {user?.isAnonymous ? "Anonymous" : user?.displayName || "User"}</h2>
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
          <button className="btn btn-secondary" onClick={handleJoinGame}>Join Game</button>
        </div>
      </div>
    </section>
  );
}
export default LandingPage;