import { useFirestoreFunctions } from "./useFirestoreFunctions";
import calculateWinner from "../utils/calculateWinner";
import { useGameDetails } from "../context/GameContext";
import toast from "react-hot-toast";

interface GameMember {
  id: string;
  displayName: string;
  cards?: string[];
}

const useWinnerHandling = () => {
  const { getMembers, updateGameDoc } = useFirestoreFunctions();
  const { setGameState } = useGameDetails();

  // Determines the winner of the game based on the players hands using the calculateWinner util function
  // Updates the game document with the winner's details and sets the game state to trigger game end in Game.tsx
  const determineWinner = async (gameId: string) => {
    try {
      const members = (await getMembers(gameId)) as GameMember[];

      const playerCards: string[][] = members.map(
        (member: GameMember) => member.cards || [],
      );

      const playerNames = members.map(
        (member: GameMember) => member.displayName || "Unknown Player",
      );
      const playerIds = members.map((member: GameMember) => member.id);

      const { winnerIndex, winningSpecialHand, allHands } =
        calculateWinner(playerCards);

      const winnerName = playerNames[winnerIndex];
      const winnerId = playerIds[winnerIndex];

      // Add playerName field to each hand
      for (let i = 0; i < allHands.length; i++) {
        allHands[i].playerName = playerNames[allHands[i].playerIndex];
      }

      // Update the game document with the winner's details and all players' hands
      await updateGameDoc(gameId, {
        gameState: `Game ended. ${winnerName} wins with ${winningSpecialHand}!`,
        winner: winnerId,
        winnerName: winnerName,
        winnerSpecialHand: winningSpecialHand,
        allHands: allHands,
        gameEnded: true,
      });

      setGameState(
        `Game ended. ${winnerName} wins with ${winningSpecialHand}!`,
      );
    } catch (error) {
      toast.error("Failed to determine the winner");
    }
  };

  return {
    determineWinner,
  };
};

export default useWinnerHandling;
