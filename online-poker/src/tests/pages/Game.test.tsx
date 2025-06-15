import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Game from "../../components/pages/Game";
import { useAuth } from "../../context/FirebaseAuthContext";
import { useNavigate, useParams } from "react-router";
import { useGameDetails } from "../../context/GameContext";
import { useFirestoreFunctions } from "../../hooks/useFirestoreFunctions";
import { createMockUser } from "../mock-utils";

jest.mock("../../context/FirebaseAuthContext");
jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));
jest.mock("../../context/GameContext");
jest.mock("../../hooks/useFirestoreFunctions");
jest.mock("../../components/CardsList", () => {
  return function MockCardsList() {
    return <div data-testid="cards-list">Mock Cards List</div>;
  };
});

describe("Game", () => {
  const mockNavigate = jest.fn();
  const mockWatchGameDetails = jest.fn();
  const mockWatchGameMembers = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockUser = createMockUser();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    (useParams as jest.Mock).mockReturnValue({ gameId: "test-game-123" });

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useGameDetails as jest.Mock).mockReturnValue({
      gameState: "In Progress",
      gameEnded: false,
    });

    mockWatchGameDetails.mockReturnValue(() => {});
    mockWatchGameMembers.mockReturnValue(() => {});
    (useFirestoreFunctions as jest.Mock).mockReturnValue({
      watchGameDetails: mockWatchGameDetails,
      watchGameMembers: mockWatchGameMembers,
    });
  });

  test("should render game page with correct structure", () => {
    render(<Game />);

    expect(screen.getByText("Game")).toBeInTheDocument();
    expect(screen.getByText("Game state: In Progress")).toBeInTheDocument();
    expect(screen.getByTestId("cards-list")).toBeInTheDocument();
  });

  test("should display current game state", () => {
    (useGameDetails as jest.Mock).mockReturnValue({
      gameState: "Player 2s turn",
      gameEnded: false,
    });

    render(<Game />);

    expect(screen.getByText("Game state: Player 2s turn")).toBeInTheDocument();
  });

  test("should setup game watch details/members on mount when user and gameId exist", () => {
    render(<Game />);

    expect(mockWatchGameMembers).toHaveBeenCalledWith(
      "test-game-123",
      expect.any(Function),
    );
    expect(mockWatchGameDetails).toHaveBeenCalledWith(
      "test-game-123",
      expect.any(Function),
    );
    expect(mockWatchGameDetails).toHaveBeenCalledTimes(2);
  });

  test("should not setup watcher when gameId is missing", () => {
    (useParams as jest.Mock).mockReturnValue({ gameId: undefined });

    render(<Game />);

    expect(mockWatchGameMembers).not.toHaveBeenCalled();
    expect(mockWatchGameDetails).not.toHaveBeenCalled();
  });

  test("should not setup watchers when user is missing", () => {
    (useAuth as jest.Mock).mockReturnValue({
      user: null,
    });

    render(<Game />);

    expect(mockWatchGameMembers).not.toHaveBeenCalled();
    expect(mockWatchGameDetails).not.toHaveBeenCalled();
  });

  test("should navigate to winner page when game ends", () => {
    (useGameDetails as jest.Mock).mockReturnValue({
      gameState: "Finished",
      gameEnded: true,
    });

    render(<Game />);

    expect(mockNavigate).toHaveBeenCalledWith("/winner");
  });

  test("should not navigate when game has not ended", () => {
    (useGameDetails as jest.Mock).mockReturnValue({
      gameState: "In Progress",
      gameEnded: false,
    });

    render(<Game />);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("should cleanup watchers on unmount", () => {
    const mockUnsubscribeMembers = jest.fn();
    const mockUnsubscribeGameState = jest.fn();
    const mockUnsubscribeGameTurn = jest.fn();

    mockWatchGameMembers.mockReturnValue(mockUnsubscribeMembers);
    mockWatchGameDetails
      .mockReturnValueOnce(mockUnsubscribeGameState)
      .mockReturnValueOnce(mockUnsubscribeGameTurn);

    const { unmount } = render(<Game />);
    unmount();

    expect(mockUnsubscribeMembers).toHaveBeenCalled();
    expect(mockUnsubscribeGameState).toHaveBeenCalled();
    expect(mockUnsubscribeGameTurn).toHaveBeenCalled();
  });

  test("should render CardsList component", () => {
    render(<Game />);

    expect(screen.getByTestId("cards-list")).toBeInTheDocument();
    expect(screen.getByText("Mock Cards List")).toBeInTheDocument();
  });
});
