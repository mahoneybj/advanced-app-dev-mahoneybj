import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import { useGameDetails } from "../context/GameContext";

export const gameplayLogic = (cards: string[], selectedCards: string[]) => {
    const { getGameDetails } = useFirestoreFunctions();
    const { setGameState, setCards } = useGameDetails();
    const remainingCards = cards.filter((card) => !selectedCards.includes(card));
    const gameData = getGameDetails();


    const newCardsNeeded = selectedCards.length;
    const newCards = gameData.deck.slice(gameData.deckIndex, gameData.deckIndex + newCardsNeeded);
    const updatedCards = [...remainingCards, ...newCards];
    const newDeckIndex = gameData.deckIndex + newCardsNeeded;

    const nextTurnIndex = gameData.turnIndex + 1;
    let nextPlayerId;
    let nextPlayerName;
    let gameState;

    if (nextTurnIndex >= gameData.playerCount) {
      nextPlayerId = "";
      nextPlayerName = "";
      gameState = "Calculating results"; // ADD CALL TO NEW FUNCTION
      setGameState(`Calculating results`);
    } else {
      
    }
}