import { useGameDetails } from "../context/GameContext";
import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import { useParams } from "react-router";
import { useState } from "react";
import Card from "./Card";

const CardsList = () => {
  const { cards, turn } = useGameDetails();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const { gameId } = useParams<{ gameId: string }>();
  const { gameplayTurnHandling } = useFirestoreFunctions();

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
      gameplayTurnHandling(gameId, selectedCards);
    }
  };

  const handleSubmit = () => {
    console.log("Submitting selected cards:", selectedCards);
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
            Exchange Cards
          </button>
          <button className="submit-btn" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default CardsList;
