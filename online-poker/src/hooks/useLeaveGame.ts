import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import { increment } from "firebase/firestore";
import { useGameDetails } from "../context/GameContext";
import useAsyncFunction from "./useAsyncFunction";

export function useLeaveGame() {
  const { updateGameDoc, deleteMemberDoc } = useFirestoreFunctions();
  const { setGameID } = useGameDetails();
  const asyncFunction = useAsyncFunction<any>();

  // Removes player from member subcollection and decrements player count in game document
  const leaveGame = async (gameId: string, uid: string) => {
    await deleteMemberDoc(gameId, uid);
    const gameUpdates = {
      playerCount: increment(-1),
    };

    asyncFunction.execute(
      async () => {
        await updateGameDoc(gameId, gameUpdates);
      },
      {
        loadingMessage: "Leaving game...",
        successMessage: "Left game successfully!",
        errorMessage: "Failed to leave game",
      },
    );
    setGameID(""); // Clear the game ID in the context
  };

  return {
    leaveGame,
  };
}
