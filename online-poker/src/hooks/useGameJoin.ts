import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import { useAuth } from "../context/FirebaseAuthContext";
import { increment } from "firebase/firestore";
import toast from "react-hot-toast";
import useAsyncFunction from "./useAsyncFunction";

export const useGameJoin = () => {
  const { setGameDoc, updateGameDoc, getGameDetails } = useFirestoreFunctions();
  const { user } = useAuth();
  const gameAsync = useAsyncFunction<any>();

  const processGameJoin = async (gameId: string) => {
    if (!user) {
      toast.error("You must be logged in to join a game");
      return;
    }
    if (!gameId) {
      toast.error("Please enter a game ID");
      return;
    }

    const gameData = await getGameDetails(gameId);

    if (gameData.gameState !== "Waiting") {
      toast.error("Game is already in progress");
      return;
    }

    const memberFields = {
      displayName: user?.displayName || "Anonymous Player",
    };

    await gameAsync.execute(
      async () => {
        await setGameDoc(gameId, user.uid, memberFields);
        const gameUpdate = {
          playerCount: increment(1),
        };
        await updateGameDoc(gameId, gameUpdate);
      },
      {
        loadingMessage: "Joining game...",
        successMessage: "Game joined successfully!",
        errorMessage: "Failed to join game",
      },
    );

    return gameId;
  };

  return {
    processGameJoin,
  };
};
