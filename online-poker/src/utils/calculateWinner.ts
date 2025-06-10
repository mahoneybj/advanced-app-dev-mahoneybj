export default function calculateWinner(playerCards: string[][]): { winnerIndex: number;} {
  let highestRank = -1;
    let winnerIndex = 0; 

  for (let playerIndex = 0; playerIndex < playerCards.length; playerIndex++) {
    const cards = playerCards[playerIndex];
    const currentHandRank = evaluateHand(cards);
    
    if (currentHandRank > highestRank) {
      highestRank = currentHandRank;
      winnerIndex = playerIndex;
    }
  }

  return { winnerIndex };
}

function evaluateHand(cards: string[]): number {
  // Parse cards
  const suits: string[] = [];
  const values: number[] = [];
  
  for (const card of cards) {
    // Extract value and suit (e.g., "AS" -> value="A", suit="S")
    let value = card.slice(0, -1);
    const suit = card.slice(-1);
    
    suits.push(suit);
    
    // Convert face cards to numeric values
    if (value === 'A') value = '14';
    else if (value === 'K') value = '13';
    else if (value === 'Q') value = '12';
    else if (value === 'J') value = '11';
    
    values.push(parseInt(value));
  }
  
  // Sort values in descending order
  values.sort((a, b) => b - a);
  
  // Check for different hand types and return hand rank
  if (isRoyalFlush(suits, values)) return 9;
  if (isStraightFlush(suits, values)) return 8;
  if (isFourOfAKind(values)) return 7;
  if (isFullHouse(values)) return 6;
  if (isFlush(suits)) return 5;
  if (isStraight(values)) return 4;
  if (isThreeOfAKind(values)) return 3;
  if (isTwoPair(values)) return 2;
  if (isPair(values)) return 1;
  
  return 0;
}

// Helper functions to check each hand type
function isRoyalFlush(suits: string[], values: number[]): boolean {
  return isFlush(suits) && values.toString() === [14, 13, 12, 11, 10].toString();
}

function isStraightFlush(suits: string[], values: number[]): boolean {
  return isFlush(suits) && isStraight(values);
}

function isFourOfAKind(values: number[]): boolean {
  const valueCounts = countOccurrences(values);
  return Object.values(valueCounts).includes(4);
}

function isFullHouse(values: number[]): boolean {
  const valueCounts = countOccurrences(values);
  const counts = Object.values(valueCounts);
  return counts.includes(3) && counts.includes(2);
}

function isFlush(suits: string[]): boolean {
  return new Set(suits).size === 1;
}

function isStraight(values: number[]): boolean {
  // Special case for A-5 straight
  if (JSON.stringify(values) === JSON.stringify([14, 5, 4, 3, 2])) {
    return true;
  }
  
  for (let i = 0; i < values.length - 1; i++) {
    if (values[i] - values[i + 1] !== 1) {
      return false;
    }
  }
  return true;
}

function isThreeOfAKind(values: number[]): boolean {
  const valueCounts = countOccurrences(values);
  return Object.values(valueCounts).includes(3);
}

function isTwoPair(values: number[]): boolean {
  const valueCounts = countOccurrences(values);
  const pairCount = Object.values(valueCounts).filter(count => count === 2).length;
  return pairCount === 2;
}

function isPair(values: number[]): boolean {
  const valueCounts = countOccurrences(values);
  return Object.values(valueCounts).includes(2);
}

function countOccurrences(arr: number[]): Record<number, number> {
  return arr.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);
}