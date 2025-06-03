import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import { useAuth } from "../context/FirebaseAuthContext";
import { useGameDetails } from "../context/GameContext";
import { increment } from "firebase/firestore";
import toast from "react-hot-toast";

export const useGameJoin = () => {
  const { setGameDoc, updateGameDoc, getGameDetails } = useFirestoreFunctions();
  const { user } = useAuth();
  const { setGameID } = useGameDetails();

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
    if (!gameData.exists()) {
      throw new Error("Game not found");
    }

    if (gameData.data().gameState !== "Waiting") {
      toast.error("Game is already in progress");
      return;
    }

    const memberFields = {
      displayName: user?.displayName || "Anonymous Player",
    };

    await setGameDoc(gameId, user.uid, memberFields);
    setGameID(gameId);

    const gameUpdate = {
      playerCount: increment(1),
    };
    await updateGameDoc(gameId, gameUpdate);
    return gameId;
  };

  return {
    processGameJoin,
  };
};
