// Removes selected cards from full deck of cards and returns the remaining cards
export const cardRemove = (cards: string[], selectedCards: string[]) => {
  const removedCards = cards.filter((card) => !selectedCards.includes(card));
  return removedCards;
};
