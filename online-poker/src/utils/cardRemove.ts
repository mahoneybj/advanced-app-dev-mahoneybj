export const cardRemove = (cards: string[], selectedCards: string[]) => {
  const removedCards = cards.filter((card) => !selectedCards.includes(card));
  return removedCards;
};
