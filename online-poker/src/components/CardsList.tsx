import { useGameDetails } from "../context/GameContext";
import { useState } from "react";
import Card from "./Card";




const CardsList = () => {
  const { cards } = useGameDetails();
  const [selectedCards, setSelectedCards] = useState<string[]>([]);

  const handleCardSelect = (card: string, isSelected: boolean) => { // AI Generated, rewrite later to understand better
    if (isSelected) {
      setSelectedCards((prev) => [...prev, card]);
    } else {
      setSelectedCards((prev) => prev.filter((c) => c !== card));
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
        />
      ))}
    </div>
  );
};

export default CardsList;
