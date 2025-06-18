/**
 * Determines the winner from an array of player hands by evaluating poker hand rankings
 * Scoring rules based on: https://www.888poker.com/magazine/how-to-play-poker/hands
 */
export default function calculateWinner(playerCards: string[][]): {
  winnerIndex: number;
} {
  let highestRank = -1;
  let winnerIndex = 0;

  // Iterate through each player's hand to find the highest ranking hand
  for (let playerIndex = 0; playerIndex < playerCards.length; playerIndex++) {
    const cards = playerCards[playerIndex];
    const currentHandRank = evaluateHand(cards);

    // Update winner if current hand has higher rank
    if (currentHandRank > highestRank) {
      highestRank = currentHandRank;
      winnerIndex = playerIndex;
    }
  }

  return { winnerIndex };
}

/**
 * Evaluates a poker hand and returns its rank
 * Splits cards into values and suits, sorts values high to low
 * Checks for special hands following poker rules
 * if no special hand, returns highest card value divided by 15 to keep value < 1
 */
function evaluateHand(cards: string[]): number {
  const suits: string[] = [];
  const values: number[] = [];
  
  // Splits cards into array of values and suits
  for (const card of cards) {
    let value = card.slice(0, -1); // First char (value)
    const suit = card.slice(-1);   // Last char (suit)

    suits.push(suit);

    // Change str values into numbers 
    if (value === "A") value = "14";      // Ace
    else if (value === "K") value = "13"; // King
    else if (value === "Q") value = "12"; // Queen
    else if (value === "J") value = "11"; // Jack
    else if (value === "T") value = "10"; // Ten

    values.push(parseInt(value));
  }

  // Sort values in desc for easier hand ranking
  values.sort((a, b) => b - a);

  // Check for each special hand
  if (isRoyalFlush(suits, values)) return 9;
  if (isStraightFlush(suits, values)) return 8;
  if (isFourOfAKind(values)) return 7;
  if (isFullHouse(values)) return 6;
  if (isFlush(suits)) return 5;
  if (isStraight(values)) return 4;
  if (isThreeOfAKind(values)) return 3;
  if (isTwoPair(values)) return 2;
  if (isPair(values)) return 1;
  
  // If no special hand will get highest card
  return highCard(values);
}

// Special hand functions

// Checks if hand is a royal flush (A, K, Q, J, 10 all same suit) using isFlush for suit check
function isRoyalFlush(suits: string[], values: number[]): boolean {
  return (
    isFlush(suits) && values.toString() === [14, 13, 12, 11, 10].toString()
  );
}

// Checks if hand is a straight flush (5 consecutive cards, same suit) using isStraight for value check
function isStraightFlush(suits: string[], values: number[]): boolean {
  return isFlush(suits) && isStraight(values);
}

// Checks if hand contains four of a Kind (4 cards of same value) suit not checked. Uses countOccurrences for recurrence value
function isFourOfAKind(values: number[]): boolean {
  const valueCounts = countOccurrences(values);
  return Object.values(valueCounts).includes(4);
}

// Checks if hand is a full house eg: 3 of one 6's + 2 of 7's
function isFullHouse(values: number[]): boolean {
  const valueCounts = countOccurrences(values);
  const counts = Object.values(valueCounts);
  return counts.includes(3) && counts.includes(2);
}

// Checks if hand is a flush, all the same suit (different values)
function isFlush(suits: string[]): boolean {
  return new Set(suits).size === 1; // New set removes all duplicates so if all the same suit, size will be 1
}

// Checks if hand is a straight (5 consecutive card values)
function isStraight(values: number[]): boolean {
  // Itterate through checkking each value is 1 less than other
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) {
      return false;
    }
  }
  return true;
}

// Checks if hand contains three of a kind (3 cards of same value)
function isThreeOfAKind(values: number[]): boolean {
  const valueCounts = countOccurrences(values);
  return Object.values(valueCounts).includes(3);
}

// Checks if hand contains two pair (2 different pairs)
function isTwoPair(values: number[]): boolean {
  const valueCounts = countOccurrences(values);
  const pairCount = Object.values(valueCounts).filter(
    (count) => count === 2,
  ).length;
  return pairCount === 2;
}

// Checks if hand contains a pair (2 cards of same value)
function isPair(values: number[]): boolean {
  const valueCounts = countOccurrences(values);
  return Object.values(valueCounts).includes(2);
}

// Utility function to count occurrences of each card value (AI)
function countOccurrences(arr: number[]): Record<number, number> {
  return arr.reduce(
    (frequencyMap, currentValue) => {
      frequencyMap[currentValue] = (frequencyMap[currentValue] || 0) + 1;
      return frequencyMap;
    },
    {} as Record<number, number>,
  );
}

// Returns the highest card value in the hand divided by 15 to return value less than 1
function highCard(values: number[]): number {
  return (values[0]/15); // Array sorted for highest card first
}