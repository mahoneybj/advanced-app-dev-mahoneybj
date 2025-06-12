import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Player from '../../components/Player';
import { createMockPlayer } from '../mock-utils';

describe('Player Component', () => {
  test('should render player name correctly', () => {
    const mockPlayer = createMockPlayer({ displayName: 'John Doe' });
    
    render(<Player player={mockPlayer.displayName} id={mockPlayer.id} />);
    
    expect(screen.getByText('Player Name: John Doe')).toBeInTheDocument();
  });

  test('should render with different player name', () => {
    const mockPlayer = createMockPlayer({ displayName: 'Jane Smith' });
    
    render(<Player player={mockPlayer.displayName} id={mockPlayer.id} />);
    
    expect(screen.getByText('Player Name: Jane Smith')).toBeInTheDocument();
  });

  test('should render with empty player name', () => {
    const mockPlayer = createMockPlayer({ displayName: '' });
    
    render(<Player player={mockPlayer.displayName} id={mockPlayer.id} />);
    
    expect(screen.getByText('Player Name:')).toBeInTheDocument();
  });

  test('should render with special characters in name', () => {
    const mockPlayer = createMockPlayer({ displayName: 'Player@123!' });
    
    render(<Player player={mockPlayer.displayName} id={mockPlayer.id} />);
    
    expect(screen.getByText('Player Name: Player@123!')).toBeInTheDocument();
  });

  test('should render with long player name', () => {
    const longName = 'VeryLongPlayerNameThatShouldStillRenderCorrectly';
    const mockPlayer = createMockPlayer({ displayName: longName });
    
    render(<Player player={mockPlayer.displayName} id={mockPlayer.id} />);
    
    expect(screen.getByText(`Player Name: ${longName}`)).toBeInTheDocument();
  });

  test('should have correct CSS class', () => {
    const mockPlayer = createMockPlayer();
    
    render(<Player player={mockPlayer.displayName} id={mockPlayer.id} />);
    
    const playerDiv = screen.getByText('Player Name: Player 1').closest('.player');
    expect(playerDiv).toBeInTheDocument();
    expect(playerDiv).toHaveClass('player');
  });

  test('should render with different id prop', () => {
    const mockPlayer = createMockPlayer({ id: 'custom-id-123' });
    
    render(<Player player={mockPlayer.displayName} id={mockPlayer.id} />);
    
    expect(screen.getByText('Player Name: Player 1')).toBeInTheDocument();
  });
});