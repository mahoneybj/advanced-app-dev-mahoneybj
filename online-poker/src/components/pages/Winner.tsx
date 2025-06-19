import React from "react";
import { useNavigate } from "react-router";
import { useGameDetails } from "../../context/GameContext";

const Winner: React.FC = () => {
  const navigate = useNavigate();
  const { winnerName, winnerSpecialHand, allHands, resetGame } = useGameDetails();

  const handleReturnToHome = () => {
    resetGame();
    navigate("/");
  };


  return (
    <div className="winner-container">
      <h1 className="winner-title">Winner!</h1>

      <div className="winner-card">
        <h2>{winnerName || "Unknown Player"} Wins!</h2>
      </div>

      <div className="winner-actions">
        <button onClick={handleReturnToHome} className="home-btn">
          Return to home
        </button>
      </div>
    </div>
  );
};

export default Winner;
