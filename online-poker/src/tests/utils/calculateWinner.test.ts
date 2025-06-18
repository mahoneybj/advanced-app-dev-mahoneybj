import calculateWinner from '../../utils/calculateWinner';

describe('calculateWinner', () => {

  test('returns the player with the highest hand', () => {
    const playerCards = [
      ["2H", "3H", "4H", "5H", "6H"], // Player 0: Straight Flush
      ["AS", "KS", "QS", "JS", "TS"], // Player 1: Royal Flush
      ["7C", "7S", "7H", "7D", "JC"], // Player 2: Four of a Kind
    ];
    
    const { winnerIndex } = calculateWinner(playerCards);
    expect(winnerIndex).toBe(1); // Player 1 has Royal Flush, which is highest
  });

  test('returns the player with the highest hand, mixed sort', () => {
    const playerCards = [
      ["4H", "5H", "6H","2H", "3H"], // Player 0: straight flush mix
      ["JS", "TS","AS", "KS", "QS"], // Player 1: royal flush mix
      ["7D", "JC", "7C", "7S", "7H"], // Player 2: four of a kind mix
    ];
    
    const { winnerIndex } = calculateWinner(playerCards);
    expect(winnerIndex).toBe(1); // Player 1 has Royal Flush, which is highest
  });

});