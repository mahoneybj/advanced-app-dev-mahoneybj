import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Lobby from "../../components/pages/Lobby";
import { useAuth } from "../../context/FirebaseAuthContext";
import { useNavigate, useParams } from "react-router";
import { useGameStart } from "../../hooks/useGameStart";
import { useLeaveGame } from "../../hooks/useLeaveGame";
import { useLoading } from "../../context/IsLoadingContext";
import { useGameDetails } from "../../context/GameContext";
import { createMockUser, createMockGame } from "../mock-utils";

jest.mock("../../context/FirebaseAuthContext");
jest.mock("../../context/GameContext");
jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
  useParams: jest.fn(),
}));
jest.mock("../../hooks/useGameStart");
jest.mock("../../hooks/useLeaveGame");
jest.mock("../../context/IsLoadingContext");
jest.mock("../../hooks/useFirestoreFunctions");
jest.mock("../../components/PlayersList", () => {
  return function MockPlayersList({ gameID }: { gameID: string }) {
    return <div data-testid="players-list">Players for game: {gameID}</div>;
  };
});

describe("Lobby", () => {
  const mockNavigate = jest.fn();
  const mockProcessGameStart = jest.fn();
  const mockLeaveGame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const mockUser = createMockUser();
    (useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    });

    (useGameDetails as jest.Mock).mockReturnValue({
      gameID: "test-game-123",
      gameState: "Waiting",
      playerCount: 2,
    });

    (useParams as jest.Mock).mockReturnValue({ gameId: "test-game-123" });

    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useLeaveGame as jest.Mock).mockReturnValue({
      leaveGame: mockLeaveGame,
    });

    (useGameStart as jest.Mock).mockReturnValue({
      processGameStart: mockProcessGameStart,
    });

    (useLoading as jest.Mock).mockReturnValue({
      isLoading: false,
    });
  });

  test("should render game id", () => {
    render(<Lobby />);
    expect(screen.getByText("test-game-123")).toBeInTheDocument();
  });

  test("should render lobby header and welcome message", () => {
    render(<Lobby />);
    expect(
      screen.getByText("Welcome to your poker lobby!"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Share your Game ID for friends to join:"),
    ).toBeInTheDocument();
  });

  test("should render PlayersList component with correct gameID", () => {
    render(<Lobby />);
    expect(screen.getByTestId("players-list")).toBeInTheDocument();
    expect(
      screen.getByText("Players for game: test-game-123"),
    ).toBeInTheDocument();
  });

  test("should call processGameStart when start game button is clicked", async () => {
    const mockGame = createMockGame();
    mockProcessGameStart.mockResolvedValueOnce([mockGame, []]);

    render(<Lobby />);
    const startButton = screen.getByText("Start Game");

    fireEvent.click(startButton);

    await screen.findByText("test-game-123");

    expect(mockProcessGameStart).toHaveBeenCalledWith("test-game-123");
    expect(mockNavigate).toHaveBeenCalledWith("/game/test-game-123");
  });

  test("should handle leave game functionality", async () => {
    mockLeaveGame.mockResolvedValueOnce(undefined);

    render(<Lobby />);

    const leaveButton = screen.getByText("Leave Game");
    fireEvent.click(leaveButton);

    await screen.findByText("test-game-123");

    expect(mockLeaveGame).toHaveBeenCalledWith("test-game-123", "test-uid");
  });

  test("should navigate to game when gameState changes to In progress", async () => {

    render(<Lobby />);

    await screen.findByText("test-game-123");

    expect(mockNavigate).not.toHaveBeenCalledWith("/game/test-game-123");

    // Update gameState
    (useGameDetails as jest.Mock).mockReturnValue({
      gameID: "test-game-123",
      gameState: "In progress",
      playerCount: 2,
    });

    render(<Lobby />);

    expect(mockNavigate).toHaveBeenCalledWith("/game/test-game-123");
  });

  test("should not render start game button if player count is less than 2", () => {
    (useGameDetails as jest.Mock).mockReturnValue({
      gameID: "test-game-123",
      gameState: "Waiting",
      playerCount: 1,
    });

    render(<Lobby />);
    expect(screen.queryByText("Start Game")).not.toBeInTheDocument();
  });
});
