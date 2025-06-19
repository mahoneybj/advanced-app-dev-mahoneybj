import calculateWinner from "../../utils/calculateWinner";

describe("calculateWinner", () => {
  describe("hand evaluation", () => {
    test("returns the player with the highest hand", () => {
      const playerCards = [
        ["2H", "3H", "4H", "5H", "6H"], // Player 0: Straight Flush
        ["AS", "KS", "QS", "JS", "TS"], // Player 1: Royal Flush
        ["7C", "7S", "7H", "7D", "JC"], // Player 2: Four of a Kind
      ];

      const { winnerIndex } = calculateWinner(playerCards);
      expect(winnerIndex).toBe(1); // Player 1 should win
    });

    test("returns the player with the highest hand, mixed sort", () => {
      const playerCards = [
        ["4H", "5H", "6H", "2H", "3H"], // Player 0: straight flush mix
        ["JS", "TS", "AS", "KS", "QS"], // Player 1: royal flush mix
        ["7D", "JC", "7C", "7S", "7H"], // Player 2: four of a kind mix
      ];

      const { winnerIndex } = calculateWinner(playerCards);
      expect(winnerIndex).toBe(1); // Player 1 should win
    });

    test("identifies straight flush", () => {
      const playerCards = [
        ["9H", "8H", "7H", "6H", "5H"], // Straight flush
        ["AS", "KD", "QH", "JC", "TD"], // Straight
      ];

      expect(calculateWinner(playerCards).winnerIndex).toBe(0);
    });

    test("identifies four of a kind", () => {
      const playerCards = [
        ["9H", "9D", "9S", "9C", "5H"], // four of a kind
        ["AH", "AD", "AC", "KH", "KD"], // full house
      ];

      expect(calculateWinner(playerCards).winnerIndex).toBe(0);
    });

    test("identifies full house", () => {
      const playerCards = [
        ["9H", "9D", "9S", "5C", "5H"], // full house
        ["AH", "KH", "QH", "JH", "9H"], // flush
      ];

      expect(calculateWinner(playerCards).winnerIndex).toBe(0);
    });

    test("identifies flush", () => {
      const playerCards = [
        ["AH", "KH", "QH", "JH", "9H"], // flush
        ["9S", "8C", "7D", "6H", "5S"], // straight
      ];

      expect(calculateWinner(playerCards).winnerIndex).toBe(0);
    });

    test("identifies straight", () => {
      const playerCards = [
        ["9S", "8C", "7D", "6H", "5S"], // straight
        ["AH", "AD", "AC", "KS", "QS"], // three of a kind
      ];

      expect(calculateWinner(playerCards).winnerIndex).toBe(0);
    });

    test("identifies three of a kind", () => {
      const playerCards = [
        ["AH", "AD", "AC", "KS", "QS"], // three of a kind
        ["6H", "6D", "3S", "3C", "JS"], // two pair
      ];

      expect(calculateWinner(playerCards).winnerIndex).toBe(0);
    });

    test("identifies two pair", () => {
      const playerCards = [
        ["6H", "6D", "3S", "3C", "JS"], // two pair
        ["AH", "AD", "KC", "QS", "JS"], // pair
      ];

      expect(calculateWinner(playerCards).winnerIndex).toBe(0);
    });

    test("identifies pair", () => {
      const playerCards = [
        ["7H", "7D", "2C", "5S", "4S"], // pair
        ["AH", "6D", "5C", "JS", "9S"], // high card
      ];

      expect(calculateWinner(playerCards).winnerIndex).toBe(0);
    });

    test("identifies high card", () => {
      const playerCards = [
        ["TH", "5D", "8C", "AS", "3S"], // high card: ace
        ["3H", "5D", "7C", "TS", "KS"], // high card: king
      ];

      expect(calculateWinner(playerCards).winnerIndex).toBe(0);
    });
  });

  // tie handling tests
  /*   describe('tie handling', () => {
    test('compares equal hand types by highest card', () => {
      const playerCards = [
        ["AH", "AD", "4H", "4D", "QS"], // Two Pair: A,4
        ["AH", "AS", "QH", "QD", "KS"]  // Two Pair: A,Q
      ];
      
      expect(calculateWinner(playerCards).winnerIndex).toBe(1);
    });
  }); */

  describe("edge cases", () => {
    test("handles many players", () => {
      const playerCards = [
        ["2H", "3H", "4H", "5H", "6H"],
        ["AH", "AD", "4H", "4D", "QS"],
        ["KH", "KD", "4H", "4D", "QS"],
        ["TS", "JS", "KS", "QS", "AS"], // royal flush
      ];
      expect(calculateWinner(playerCards).winnerIndex).toBe(3);
    });
  });
});
