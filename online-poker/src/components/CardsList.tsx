import { useGameDetails } from "../context/GameContext";
import { useGameplayHandling } from "../hooks/useGameplayHandling";
import { useLoading } from "../context/IsLoadingContext";
import { useParams } from "react-router";
import { useState } from "react";
import Card from "./Card";

const CardsList = () => {
  const { cards, turn } = useGameDetails();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const { gameId } = useParams<{ gameId: string }>();
  const { processGameTurnHandling } = useGameplayHandling();
  const { isLoading } = useLoading();

  // Handles card selection and updates the selected cards state
  // AI Generated
  const handleCardSelect = (card: string, isSelected: boolean) => {
    if (isSelected) {
      setSelectedCards((prev) => [...prev, card]);
    } else {
      setSelectedCards((prev) => prev.filter((c) => c !== card));
    }
  };

  // When player is ready, processGameTurnHandling is called with the gameId and selectedCards to be exchanged
  const handleCardExchange = () => {
    if (gameId) {
      processGameTurnHandling(gameId, selectedCards);
    }
  };

  return (
    <div className="cards-list">
      {cards.map((card, index) => (
        <Card
          key={index}
          card={card}
          isSelected={selectedCards.includes(card)}
          onSelect={handleCardSelect}
          turn={turn}
        />
      ))}
      {turn && (
        <div className="game-btn">
          <button
            className="exchange-btn"
            onClick={handleCardExchange}
            disabled={isLoading}
          >
            Exchange/Submit Cards
          </button>
        </div>
      )}
    </div>
  );
};

export default CardsList;
