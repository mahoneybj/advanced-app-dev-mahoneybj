// Mock util functions for testing in an attempt to reduce code repeating
export const createMockUser = (overrides = {}) => ({
  uid: "test-uid",
  displayName: "Test User",
  ...overrides,
});

export const createMockGame = (overrides = {}) => ({
  id: "test-game-123",
  gameState: "Waiting",
  gameEnded: false,
  ...overrides,
});

export const createMockPlayer = (overrides = {}) => ({
  id: "player-1",
  displayName: "Player 1",
  ...overrides,
});
