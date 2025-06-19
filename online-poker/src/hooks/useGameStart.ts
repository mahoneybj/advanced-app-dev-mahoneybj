import { GameData, Member } from "../utils/gameTypes";
import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import { useGameDetails } from "../context/GameContext";

export const useGameStart = () => {
  const { updateGameDoc, updateMembersDoc, getMembers, getGameDetails } =
    useFirestoreFunctions();
  const { setGameState } = useGameDetails();

  // Processes the game start logic, dealing cards to players and updating game state
  const processGameStart = async (
    gameId: string,
  ): Promise<[GameData, Member[]]> => {
    const gameData = await getGameDetails(gameId);
    const members = await getMembers(gameId);

    // Get deck index, if not set, default to 0
    let currentDeckIndex = gameData.deckIndex || 0;
    const deck = gameData.deck;

    // Deal 5 cards to each player
    for (const Member of members) {
      const playerCards = deck.slice(currentDeckIndex, currentDeckIndex + 5);
      currentDeckIndex += 5;

      await updateMembersDoc(gameId, Member.id, {
        cards: playerCards,
      });
    }

    // Update game data
    const memberIds: string[] = members.map((Member: Member) => Member.id);
    const firstPlayer = memberIds[0];

    const firstPlayerName = members[0].displayName;

    const gameUpdates = {
      currentTurn: firstPlayer,
      turnOrder: memberIds,
      deckIndex: currentDeckIndex,
      gameState: `${firstPlayerName}'s turn`,
    };

    await updateGameDoc(gameId, gameUpdates);
    setGameState(`${firstPlayerName}'s turn`);

    // Return updated game data and members
    const updatedGameData: GameData = {
      ...gameData,
      ...gameUpdates,
    };

    return [updatedGameData, members];
  };

  return {
    processGameStart,
  };
};
