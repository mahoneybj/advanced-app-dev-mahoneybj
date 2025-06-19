import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Game from "../../components/pages/Game";
import { useNavigate, useParams } from "react-router";
import { useGameDetails } from "../../context/GameContext";

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));
jest.mock("../../context/GameContext");
jest.mock("../../components/CardsList", () => {
  return function MockCardsList() {
    return <div data-testid="cards-list">Mock Cards List</div>;
  };
});

describe("Game", () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    (useParams as jest.Mock).mockReturnValue({ gameId: "test-game-123" });
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useGameDetails as jest.Mock).mockReturnValue({
      gameState: "In Progress",
      gameEnded: false,
      cards: [],
      turn: false,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("should render game page with correct structure", () => {
    render(<Game />);

    expect(screen.getByText("Game")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByTestId("cards-list")).toBeInTheDocument();
  });

  test("should display current game state", () => {
    (useGameDetails as jest.Mock).mockReturnValue({
      gameState: "Player 2s turn",
      gameEnded: false,
      cards: [],
      turn: false,
    });

    render(<Game />);

    expect(screen.getByText("Player 2s turn")).toBeInTheDocument();
  });

  test("should navigate to winner page when game ends", async () => {
    (useGameDetails as jest.Mock).mockReturnValue({
      gameState: "Finished",
      gameEnded: true,
      cards: [],
      turn: false,
    });

    render(<Game />);

    jest.advanceTimersByTime(6000);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/winner/test-game-123");
    });
  });

  test("should not navigate when game has not ended", () => {
    (useGameDetails as jest.Mock).mockReturnValue({
      gameState: "In Progress",
      gameEnded: false,
      cards: [],
      turn: false,
    });

    render(<Game />);

    jest.advanceTimersByTime(6000);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("should cleanup timeout on unmount", () => {
    (useGameDetails as jest.Mock).mockReturnValue({
      gameState: "Finished",
      gameEnded: true,
      cards: [],
      turn: false,
    });

    const { unmount } = render(<Game />);

    unmount();

    jest.advanceTimersByTime(6000);

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("should render CardsList component", () => {
    render(<Game />);

    expect(screen.getByTestId("cards-list")).toBeInTheDocument();
    expect(screen.getByText("Mock Cards List")).toBeInTheDocument();
  });
});
