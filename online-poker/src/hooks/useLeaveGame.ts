import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import { increment } from "firebase/firestore";
import { useGameDetails } from "../context/GameContext";

export function useLeaveGame() {
  const { updateGameDoc, deleteMemberDoc } = useFirestoreFunctions();
  const { setGameID } = useGameDetails();

  const leaveGame = async (gameId: string, uid: string) => {
    await deleteMemberDoc(gameId, uid);
    const gameUpdates = {
      playerCount: increment(-1),
    };

    await updateGameDoc(gameId, gameUpdates);
    setGameID("");
  };

  return {
    leaveGame,
  };
}
