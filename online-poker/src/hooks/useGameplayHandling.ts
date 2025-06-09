import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import { useAuth } from "../context/FirebaseAuthContext";
import { useGameDetails } from "../context/GameContext";
import { cardRemove } from "../utils/cardRemove";
import toast from "react-hot-toast";


export const useGameplayHandling = () => {
  const { getGameDetails, getMember, updateMembersDoc, updateGameDoc } = useFirestoreFunctions();
  const { user } = useAuth();
  const { cards, setCards, setTurn, setGameState } = useGameDetails();

  const processGameTurnHandling = async (gameId: string, selectedCards: string[]) => {
   if (!user) {
      toast.error("You must be logged in to join a game");
      return;
    }
    if (!gameId) {
      toast.error("Please enter a game ID");
      return;
    }

    const gameData = await getGameDetails(gameId);

    const remainingCards = cardRemove(cards, selectedCards);
    
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
          nextPlayerId = gameData.turnOrder[nextTurnIndex];

          const nextPlayerDoc = await getMember(gameId, nextPlayerId);

          nextPlayerName = nextPlayerDoc.data()?.displayName || "Next player";
          gameState = `${nextPlayerName}'s turn`;
          setGameState(`${nextPlayerName}'s turn`);
        }

    await updateMembersDoc(gameId, user.uid, {
      cards: updatedCards,
    });

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