import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '../../components/pages/LandingPage';
import { useAuth } from "../../context/FirebaseAuthContext";
import { useNavigate } from "react-router";
import { useCreateGame } from "../../hooks/useCreateGame";
import { useGameJoin } from "../../hooks/useGameJoin";
import { useLoading } from "../../context/IsLoadingContext";
import { useGameDetails } from "../../context/GameContext";
import { createMockUser, createMockGame } from '../mock-utils';

// Mock all the hooks used in LandingPage
jest.mock('../../context/FirebaseAuthContext');
jest.mock('react-router', () => ({
  useNavigate: jest.fn()
}));
jest.mock('../../hooks/useCreateGame');
jest.mock('../../hooks/useGameJoin');
jest.mock('../../context/IsLoadingContext');
jest.mock('../../context/GameContext');

describe('LandingPage', () => {
  const mockNavigate = jest.fn();
  const mockProcessGameCreate = jest.fn();
  const mockProcessGameJoin = jest.fn();
  const mockSetGameID = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    const mockUser = createMockUser();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser
    });
    
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    
    (useCreateGame as jest.Mock).mockReturnValue({
      processGameCreate: mockProcessGameCreate
    });
    
    (useGameJoin as jest.Mock).mockReturnValue({
      processGameJoin: mockProcessGameJoin
    });
    
    (useLoading as jest.Mock).mockReturnValue({
      isLoading: false
    });
    
    (useGameDetails as jest.Mock).mockReturnValue({
      gameID: '',
      setGameID: mockSetGameID
    });
  });

  test('should render welcome message with user name', () => {
    render(<LandingPage />);
    expect(screen.getByText('Welcome, Test User')).toBeInTheDocument();
  });

  test('should call processGameCreate when Create Game button is clicked', async () => {
    const mockGame = createMockGame({ id: 'game-123' });
    mockProcessGameCreate.mockResolvedValueOnce(mockGame);
    
    render(<LandingPage />);
    
    const createButton = screen.getByText('Create Game');
    fireEvent.click(createButton);
    await screen.findByText('Welcome, Test User');
    
    expect(mockProcessGameCreate).toHaveBeenCalledWith('test-uid');
    expect(mockNavigate).toHaveBeenCalledWith('/lobby/game-123');
  });

  test('should handle join game functionality', async () => {
    mockProcessGameJoin.mockResolvedValueOnce(true);
    
    render(<LandingPage />);
    
    const input = screen.getByPlaceholderText('Enter Game ID');
    fireEvent.change(input, { target: { value: 'game-456' } });
    
    const joinButton = screen.getByText('Join Game');
    fireEvent.click(joinButton);
    await screen.findByText('Welcome, Test User');
    
    expect(mockProcessGameJoin).toHaveBeenCalledWith('game-456');
    expect(mockSetGameID).toHaveBeenCalledWith('game-456');
  });

  test('should navigate to lobby when gameID is set', () => {
    (useGameDetails as jest.Mock).mockReturnValue({
      gameID: 'already-joined-123',
      setGameID: mockSetGameID
    });
    
    render(<LandingPage />);
    
    expect(mockNavigate).toHaveBeenCalledWith('/lobby/already-joined-123');
  });

  test('should render with custom user name', () => {
    const customUser = createMockUser({ displayName: 'Jane Doe' });
    (useAuth as jest.Mock).mockReturnValue({
      user: customUser
    });
    
    render(<LandingPage />);
    expect(screen.getByText('Welcome, Jane Doe')).toBeInTheDocument();
  });

  test('should disable input when loading', () => {
    (useLoading as jest.Mock).mockReturnValue({
      isLoading: true
    });
    
    render(<LandingPage />);
    
    const input = screen.getByPlaceholderText('Enter Game ID');
    expect(input).toBeDisabled();
  });
});