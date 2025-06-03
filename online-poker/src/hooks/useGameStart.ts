import { GameData, Member } from "../utils/gameTypes";
import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";

export const useGameStart = () => {
  const { updateGameDoc, updateMembersDoc, getMembers, getGameDetails } =
    useFirestoreFunctions();

  const processGameStart = async (
    gameId: string,
  ): Promise<[GameData, Member[]]> => {
    // Get game data and members
    const gameData = await getGameDetails(gameId);
    const members = await getMembers(gameId);

    // Deck stuff
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

    // Return updated game data and members
    const updatedGameData = {
      ...gameData,
      ...gameUpdates,
    };

    return [updatedGameData, members];
  };

  return {
    processGameStart,
  };
};
