import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import LandingPage from '../components/pages/LandingPage';
import { useCreateGame } from "../hooks/useCreateGame";

// Mock the hooks
jest.mock('../hooks/useCreateGame');


describe('ItemsDisplay', () => {
  const mockTodos = [
    { id: '1', todo: 'Test Todo 1' },
    { id: '2', todo: 'Test Todo 2' },
    { id: '3', todo: 'Test Todo 3' },
  ];

  const mockGetTodos = jest.fn().mockImplementation((callback) => {
    callback(mockTodos);
    return jest.fn(); // Return unsubscribe function
  });
  
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useTodoFirebase as jest.Mock).mockReturnValue({
      getTodos: mockGetTodos
    });
    mockGetTodos.mockReturnValue(mockUnsubscribe);
  });

  test('should fetch and display todos on mount', () => {
    render(<ItemsDisplay isEditMode={false} />);

    // Check if getTodos is called
    expect(mockGetTodos).toHaveBeenCalledTimes(1);
    
   // Not Working
    mockTodos.forEach((todo) => {
      expect(screen.getByText(todo.todo)).toBeInTheDocument();
    });
  });

  test('should unsubscribe when unmounting', () => {
    const { unmount } = render(<ItemsDisplay isEditMode={false} />);
    
    unmount();
    
    // Check if the unsubscribe function was called
    expect(mockUnsubscribe).toHaveBeenCalledTimes(1);
  });

  test('should render empty list when no todos', () => {
    // Override the getTodos implementation for this specific test
    mockGetTodos.mockImplementationOnce((callback) => {
      callback([]);
      return mockUnsubscribe;
    });
    
    render(<ItemsDisplay isEditMode={false} />);
    
    // No todo items should be rendered
    expect(screen.queryByTestId(/todo-item-/)).not.toBeInTheDocument();
  });
});