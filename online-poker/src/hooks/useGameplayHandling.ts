import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import { useAuth } from "../context/FirebaseAuthContext";
import { useGameDetails } from "../context/GameContext";
import { cardRemove } from "../utils/cardRemove";
import useWinnerHandling from "./useWinnerHandling";
import toast from "react-hot-toast";

export const useGameplayHandling = () => {
  const { getGameDetails, getMember, updateMembersDoc, updateGameDoc } =
    useFirestoreFunctions();
  const { user } = useAuth();
  const { cards, setCards, setTurn, setGameState } = useGameDetails();
  const { determineWinner } = useWinnerHandling();

  // Processes the game turn handling logic, including updating the deck, player turns, and game state
  // If all turns done then it calls useWinnerHandling hook to process winner
  const processGameTurnHandling = async (
    gameId: string,
    selectedCards: string[],
  ) => {
    if (!user) {
      toast.error("You must be logged in to join a game");
      return;
    }
    if (!gameId) {
      toast.error("Please enter a game ID");
      return;
    }

    const gameData = await getGameDetails(gameId);

    const remainingCards = cardRemove(cards, selectedCards); // Removes selected cards from the current player's hand using cardRemove util function

    const newCardsNeeded = selectedCards.length; // Number of new cards to be drawn

    const newCards = gameData.deck.slice( // Getting new cards by itterating from the deck using the deckIndex ensuring no duplicates
      gameData.deckIndex,
      gameData.deckIndex + newCardsNeeded,
    );

    const updatedCards = [...remainingCards, ...newCards];

    const newDeckIndex = gameData.deckIndex + newCardsNeeded;

    const nextTurnIndex = gameData.turnIndex + 1;
    let nextPlayerId;
    let nextPlayerName;
    let gameState;

    if (nextTurnIndex >= gameData.playerCount) { // If all players have taken their turn then calculate results
      nextPlayerId = "";
      nextPlayerName = "";
      gameState = "Calculating results";
      setGameState(`Calculating results`);
      
      // Update the current player's cards in the members subcollection
      await updateMembersDoc(gameId, user.uid, {
        cards: updatedCards,
      });

      // Update the game document with the new deck index, current turn, and game state
      await updateGameDoc(gameId, {
        deckIndex: newDeckIndex,
        currentTurn: nextPlayerId,
        turnIndex: nextTurnIndex,
        gameState: gameState,
      });

      await determineWinner(gameId);
    } else {
      nextPlayerId = gameData.turnOrder[nextTurnIndex];

      const nextPlayerDoc = await getMember(gameId, nextPlayerId);

      nextPlayerName = nextPlayerDoc.displayName || "Next player";
      gameState = `${nextPlayerName}'s turn`;
      setGameState(`${nextPlayerName}'s turn`);
    }

    // Update the current player's cards in the members subcollection
    await updateMembersDoc(gameId, user.uid, {
      cards: updatedCards,
    });

    // Update the game document with the new deck index, current turn, and game state
    await updateGameDoc(gameId, {
      deckIndex: newDeckIndex,
      currentTurn: nextPlayerId,
      turnIndex: nextTurnIndex,
      gameState: gameState,
    });
    setCards(updatedCards);
    setTurn(false);

    return gameId;
  };

  return {
    processGameTurnHandling,
  };
};
