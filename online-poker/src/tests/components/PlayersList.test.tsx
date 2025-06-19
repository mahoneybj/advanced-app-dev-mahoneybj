import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import PlayersList from "../../components/PlayersList";
import { useFirestoreFunctions } from "../../hooks/useFirestoreFunctions";
import { createMockPlayer } from "../mock-utils";

jest.mock("../../hooks/useFirestoreFunctions");
jest.mock("../../components/Player", () => {
  return function MockPlayer({ player, id }: { player: string; id: string }) {
    return <div data-testid={`player-${id}`}>Player Name: {player}</div>;
  };
});

describe("PlayersList Component", () => {
  const mockWatchGameMembers = jest.fn();
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    (useFirestoreFunctions as jest.Mock).mockReturnValue({
      watchGameMembers: mockWatchGameMembers,
    });

    mockWatchGameMembers.mockReturnValue(mockUnsubscribe);
  });

  test("should be empty when no players", () => {
    mockWatchGameMembers.mockImplementation((gameId, callback) => {
      callback([]);
      return mockUnsubscribe;
    });

    render(<PlayersList gameID="test-game-123" />);

    const playerContent = document.querySelector(".player-content");
    expect(playerContent).toBeInTheDocument();
    expect(playerContent).toBeEmptyDOMElement();
  });

  test("should render single player", async () => {
    const mockPlayer = createMockPlayer({ id: "player-1", displayName: "Ben" });

    mockWatchGameMembers.mockImplementation((gameId, callback) => {
      callback([mockPlayer]);
      return mockUnsubscribe;
    });

    render(<PlayersList gameID="test-game-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("player-player-1")).toBeInTheDocument();
      expect(screen.getByText("Player Name: Ben")).toBeInTheDocument();
    });
  });

  test("should render multiple players correctly", async () => {
    const mockPlayers = [
      createMockPlayer({ id: "player-1", displayName: "John Doe" }),
      createMockPlayer({ id: "player-2", displayName: "Jane Smith" }),
      createMockPlayer({ id: "player-3", displayName: "Bob Wilson" }),
    ];

    mockWatchGameMembers.mockImplementation((gameId, callback) => {
      callback(mockPlayers);
      return mockUnsubscribe;
    });

    render(<PlayersList gameID="test-game-123" />);

    await waitFor(() => {
      expect(screen.getByTestId("player-player-1")).toBeInTheDocument();
      expect(screen.getByTestId("player-player-2")).toBeInTheDocument();
      expect(screen.getByTestId("player-player-3")).toBeInTheDocument();

      expect(screen.getByText("Player Name: John Doe")).toBeInTheDocument();
      expect(screen.getByText("Player Name: Jane Smith")).toBeInTheDocument();
      expect(screen.getByText("Player Name: Bob Wilson")).toBeInTheDocument();
    });
  });

  test("should call watchGameMembers with correct gameID", () => {
    render(<PlayersList gameID="test-game-456" />);

    expect(mockWatchGameMembers).toHaveBeenCalledWith(
      "test-game-456",
      expect.any(Function),
    );
  });

  test("should not call watchGameMembers when gameID is undefined", () => {
    render(<PlayersList />);

    expect(mockWatchGameMembers).not.toHaveBeenCalled();
  });

  test("should not call watchGameMembers when gameID is empty string", () => {
    render(<PlayersList gameID="" />);

    expect(mockWatchGameMembers).not.toHaveBeenCalled();
  });

  test("should cleanup subscription on unmount", () => {
    const { unmount } = render(<PlayersList gameID="test-game-123" />);

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  test("should update players when callback is triggered", async () => {
    let callbackFunction: (members: any[]) => void;

    mockWatchGameMembers.mockImplementation((gameId, callback) => {
      callbackFunction = callback;
      return mockUnsubscribe;
    });

    render(<PlayersList gameID="test-game-123" />);

    // Initially no players
    expect(screen.queryByTestId("player-player-1")).not.toBeInTheDocument();

    // Simulate players being added
    const newPlayers = [
      createMockPlayer({ id: "player-1", displayName: "New Player" }),
    ];

    await waitFor(() => {
      callbackFunction(newPlayers);
    });

    await waitFor(() => {
      expect(screen.getByTestId("player-player-1")).toBeInTheDocument();
      expect(screen.getByText("Player Name: New Player")).toBeInTheDocument();
    });
  });

  test("should have correct CSS class", () => {
    render(<PlayersList gameID="test-game-123" />);

    const playerContent = document.querySelector(".player-content");
    expect(playerContent).toBeInTheDocument();
    expect(playerContent).toHaveClass("player-content");
  });

  test("should handle rapid player updates", async () => {
    let callbackFunction: (members: any[]) => void;

    mockWatchGameMembers.mockImplementation((gameId, callback) => {
      callbackFunction = callback;
      return mockUnsubscribe;
    });

    render(<PlayersList gameID="test-game-123" />);

    // Simulate rapid updates
    const updates = [
      [createMockPlayer({ id: "player-1", displayName: "Player 1" })],
      [
        createMockPlayer({ id: "player-1", displayName: "Player 1" }),
        createMockPlayer({ id: "player-2", displayName: "Player 2" }),
      ],
      [createMockPlayer({ id: "player-1", displayName: "Updated Player 1" })],
    ];

    for (const update of updates) {
      await waitFor(() => {
        callbackFunction(update);
      });
    }

    // Should show the final state
    await waitFor(() => {
      expect(
        screen.getByText("Player Name: Updated Player 1"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Player Name: Player 2"),
      ).not.toBeInTheDocument();
    });
  });
});
