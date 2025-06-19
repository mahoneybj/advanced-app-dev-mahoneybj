import React from "react";
import { useNavigate } from "react-router";
import { useGameDetails } from "../../context/GameContext";
import { useLoading } from "../../context/IsLoadingContext";


const Winner: React.FC = () => {
  const navigate = useNavigate();
  const { winnerName, winnerSpecialHand, allHands, resetGame } = useGameDetails();
  const { isLoading } = useLoading();

  const handleReturnToHome = () => {
    resetGame();
    navigate("/");
  };

  // Sort hands by rank
  const sortedHands = allHands
    ? [...allHands].sort((a, b) => {
        if (a.playerName === winnerName) return -1;
        if (b.playerName === winnerName) return 1;
        return 0;
      })
    : [];

  return (
    <div className="winner-container">
      <h1 className="winner-title">Game Results</h1>

      <div className="winner-card">
        <h2>{winnerName || "Unknown Player"} Wins!</h2>
        <p className="winning-type">with {winnerSpecialHand}</p>
      </div>

      {sortedHands.length > 0 && (
        <div className="all-hands-section">
          <h3>All Player's Hand's</h3>
          <div className="hands-grid">
            {sortedHands.map((playerHand, index) => (
              <div
                key={index}
                className={`player-hand-card ${playerHand.playerName === winnerName ? "winner-hand" : "loser-hand"}`}
              >
                <div className="player-hand-header">
                  <h4>
                    {playerHand.playerName ||
                      `Player ${playerHand.playerIndex + 1}`}
                  </h4>
                  <span className="hand-type">{playerHand.handType}</span>
                </div>

                <div className="player-cards">
                  {playerHand.hand &&
                    playerHand.hand.map((card, cardIndex) => (
                      <img
                        key={cardIndex}
                        src={`/playing-cards/${card}.svg`}
                        alt={`${card} card`}
                        className="result-card-image"
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="winner-actions">
        <button onClick={handleReturnToHome} className="home-btn" disabled={isLoading}>
          Return to Home
        </button>
      </div>
    </div>
  );
};

export default Winner;
