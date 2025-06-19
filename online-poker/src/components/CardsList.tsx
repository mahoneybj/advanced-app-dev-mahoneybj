import { useGameDetails } from "../context/GameContext";
import { useGameplayHandling } from "../hooks/useGameplayHandling";
import { useParams } from "react-router";
import { useState } from "react";
import Card from "./Card";

const CardsList = () => {
  const { cards, turn } = useGameDetails();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const { gameId } = useParams<{ gameId: string }>();
  const { processGameTurnHandling } = useGameplayHandling();

  const handleCardSelect = (card: string, isSelected: boolean) => {
    // AI Generated, rewrite later to understand better
    if (isSelected) {
      setSelectedCards((prev) => [...prev, card]);
    } else {
      setSelectedCards((prev) => prev.filter((c) => c !== card));
    }
  };

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
          <button className="exchange-btn" onClick={handleCardExchange}>
            Exchange/Submit Cards
          </button>
        </div>
      )}
    </div>
  );
};

export default CardsList;
