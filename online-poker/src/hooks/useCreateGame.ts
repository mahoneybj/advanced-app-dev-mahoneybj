import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import { deckShuffle } from "../utils/deckShuffle";
import { useAuth } from "../context/FirebaseAuthContext";
import { useGameDetails } from "../context/GameContext";

export const useCreateGame = () => {
  const { createGameDoc, setGameDoc } = useFirestoreFunctions();
  const { user } = useAuth();
  const { setGameID } = useGameDetails();

  const processGameCreate = async (ownerUID: string) => {
    const deck = deckShuffle();
    const gameFields = {
      ownerUID,
      deck: deck,
      deckIndex: 0,
      gameState: "Waiting",
      currentTurn: "",
      turnOrder: [],
      turnIndex: 0,
      playerCount: 1,
    };

    const docRef = await createGameDoc(gameFields);
    const gameId = docRef.id;
    const memberFields = {
      displayName: user?.displayName || "Anonymous Player",
      isHost: true,
    };
    await setGameDoc(gameId, ownerUID, memberFields);
    setGameID(gameId); // Set the game ID in the context

    return docRef;
  };

  return {
    processGameCreate,
  };
};
