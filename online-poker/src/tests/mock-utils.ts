export const createMockUser = (overrides = {}) => ({
  uid: 'test-uid',
  displayName: 'Test User',
  ...overrides
});

export const createMockGame = (overrides = {}) => ({
  id: 'test-game-123',
  gameState: 'Waiting',
  gameEnded: false,
  ...overrides
});

export const createMockPlayer = (overrides = {}) => ({
  id: 'player-1',
  displayName: 'Player 1',
  ...overrides
});

export const mockAllHooks = () => {
  const mockNavigate = jest.fn();
  const mockProcessGameCreate = jest.fn();
  const mockProcessGameJoin = jest.fn();
  const mockSetGameID = jest.fn();
  const mockWatchGameDetails = jest.fn();
  const mockWatchGameMembers = jest.fn();

  require('../context/FirebaseAuthContext').useAuth = jest.fn();
  require('react-router').useNavigate = jest.fn().mockReturnValue(mockNavigate);
  require('react-router').useParams = jest.fn().mockReturnValue({ gameId: 'test-game' });
  require('../hooks/useCreateGame').useCreateGame = jest.fn();
  require('../hooks/useGameJoin').useGameJoin = jest.fn();
  require('../context/IsLoadingContext').useLoading = jest.fn();
  require('../context/GameContext').useGameDetails = jest.fn();
  require('../hooks/useFirestoreFunctions').useFirestoreFunctions = jest.fn();

  return {
    mockNavigate,
    mockProcessGameCreate,
    mockProcessGameJoin,
    mockSetGameID,
    mockWatchGameDetails,
    mockWatchGameMembers
  };
};