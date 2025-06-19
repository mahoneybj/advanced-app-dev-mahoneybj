import { deckShuffle } from "../../utils/deckShuffle";

describe("deckShuffle", () => {
  test("returns a shuffled deck of cards", () => {
    const deck = deckShuffle();
    expect(deck).toHaveLength(52);
    expect(deck).toEqual(
      expect.arrayContaining([expect.stringMatching(/^[2-9TJQKA][CDHS]$/)]),
    );
  });

  test("shuffles the deck randomly", () => {
    const deck1 = deckShuffle();
    const deck2 = deckShuffle();
    expect(deck1).not.toEqual(deck2);
  });

  test("contains all unique cards", () => {
    const deck = deckShuffle();
    const uniqueCards = new Set(deck);
    expect(uniqueCards.size).toBe(52);
  });
});
