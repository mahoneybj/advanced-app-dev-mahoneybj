import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import CardsList from "../../components/CardsList";
import { useGameDetails } from "../../context/GameContext";
import { useGameplayHandling } from "../../hooks/useGameplayHandling";
import { useParams } from "react-router";

jest.mock("../../context/GameContext");
jest.mock("../../hooks/useGameplayHandling");
jest.mock("react-router", () => ({
  useParams: jest.fn(),
}));
jest.mock("../../components/Card", () => {
  return function MockCard({
    card,
    isSelected,
    onSelect,
    turn,
  }: {
    card: string;
    isSelected: boolean;
    onSelect: (card: string, isSelected: boolean) => void;
    turn: boolean;
  }) {
    return (
      <div
        data-testid={`card-${card}`}
        onClick={() => onSelect(card, !isSelected)}
        className={isSelected ? "selected" : ""}
      >
        {card} - {isSelected ? "Selected" : "Not Selected"} - Turn:{" "}
        {turn.toString()}
      </div>
    );
  };
});

describe("CardsList Component", () => {
  const mockProcessGameTurnHandling = jest.fn();
  const mockCards = ["2H", "3S", "4D", "5C", "6H"];

  beforeEach(() => {
    jest.clearAllMocks();

    (useParams as jest.Mock).mockReturnValue({ gameId: "test-game-123" });

    (useGameDetails as jest.Mock).mockReturnValue({
      cards: mockCards,
      turn: true,
    });

    (useGameplayHandling as jest.Mock).mockReturnValue({
      processGameTurnHandling: mockProcessGameTurnHandling,
    });
  });

  test("should render all cards correctly", () => {
    render(<CardsList />);

    mockCards.forEach((card) => {
      expect(screen.getByTestId(`card-${card}`)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(card))).toBeInTheDocument();
    });
  });

  test("should render cards with correct initial state", () => {
    render(<CardsList />);

    mockCards.forEach((card) => {
      expect(
        screen.getByText(new RegExp(`${card}.*Not Selected.*Turn: true`)),
      ).toBeInTheDocument();
    });
  });

  test("should show exchange and submit buttons when it's player's turn", () => {
    render(<CardsList />);

    expect(screen.getByText("Exchange Cards")).toBeInTheDocument();
    expect(screen.getByText("Submit")).toBeInTheDocument();
  });

  test("should not show buttons when it's not player's turn", () => {
    (useGameDetails as jest.Mock).mockReturnValue({
      cards: mockCards,
      turn: false,
    });

    render(<CardsList />);

    expect(screen.queryByText("Exchange Cards")).not.toBeInTheDocument();
    expect(screen.queryByText("Submit")).not.toBeInTheDocument();
  });

  test("should handle card selection correctly", () => {
    render(<CardsList />);

    const firstCard = screen.getByTestId("card-2H");
    fireEvent.click(firstCard);

    expect(screen.getByText("2H - Selected - Turn: true")).toBeInTheDocument();
  });

  test("should handle multiple card selections", () => {
    render(<CardsList />);

    const firstCard = screen.getByTestId("card-2H");
    const secondCard = screen.getByTestId("card-3S");

    fireEvent.click(firstCard);
    fireEvent.click(secondCard);

    expect(screen.getByText("2H - Selected - Turn: true")).toBeInTheDocument();
    expect(screen.getByText("3S - Selected - Turn: true")).toBeInTheDocument();
  });

  test("should deselect card when clicked again", () => {
    render(<CardsList />);

    const firstCard = screen.getByTestId("card-2H");

    // Select
    fireEvent.click(firstCard);
    expect(screen.getByText("2H - Selected - Turn: true")).toBeInTheDocument();

    // Unselect
    fireEvent.click(firstCard);
    expect(
      screen.getByText("2H - Not Selected - Turn: true"),
    ).toBeInTheDocument();
  });

  test("should call processGameTurnHandling with selected cards when exchange button is clicked", () => {
    render(<CardsList />);

    const firstCard = screen.getByTestId("card-2H");
    const secondCard = screen.getByTestId("card-3S");

    fireEvent.click(firstCard);
    fireEvent.click(secondCard);

    const exchangeButton = screen.getByText("Exchange Cards");
    fireEvent.click(exchangeButton);

    expect(mockProcessGameTurnHandling).toHaveBeenCalledWith("test-game-123", [
      "2H",
      "3S",
    ]);
  });

  test("should call processGameTurnHandling with empty array when no cards selected", () => {
    render(<CardsList />);

    const exchangeButton = screen.getByText("Exchange Cards");
    fireEvent.click(exchangeButton);

    expect(mockProcessGameTurnHandling).toHaveBeenCalledWith(
      "test-game-123",
      [],
    );
  });

  test("should not call processGameTurnHandling when gameId is missing", () => {
    (useParams as jest.Mock).mockReturnValue({ gameId: undefined });

    render(<CardsList />);

    const exchangeButton = screen.getByText("Exchange Cards");
    fireEvent.click(exchangeButton);

    expect(mockProcessGameTurnHandling).not.toHaveBeenCalled();
  });

  test("should pass correct turn prop to Card components", () => {
    (useGameDetails as jest.Mock).mockReturnValue({
      cards: mockCards,
      turn: false,
    });

    render(<CardsList />);

    mockCards.forEach((card) => {
      expect(
        screen.getByText(new RegExp(`${card}.*Turn: false`)),
      ).toBeInTheDocument();
    });
  });

  test("should maintain selected state across rerenders", () => {
    const { rerender } = render(<CardsList />);

    const firstCard = screen.getByTestId("card-2H");
    fireEvent.click(firstCard);

    expect(screen.getByText("2H - Selected - Turn: true")).toBeInTheDocument();

    // Rerender
    rerender(<CardsList />);

    // Selection should stay
    expect(screen.getByText("2H - Selected - Turn: true")).toBeInTheDocument();
  });

  test("should handle selection of all cards", () => {
    render(<CardsList />);

    // Select all
    mockCards.forEach((card) => {
      const cardElement = screen.getByTestId(`card-${card}`);
      fireEvent.click(cardElement);
    });

    // All cards should be selected
    mockCards.forEach((card) => {
      expect(
        screen.getByText(new RegExp(`${card}.*Selected`)),
      ).toBeInTheDocument();
    });

    // Should exchange all cards
    const exchangeButton = screen.getByText("Exchange Cards");
    fireEvent.click(exchangeButton);

    expect(mockProcessGameTurnHandling).toHaveBeenCalledWith(
      "test-game-123",
      mockCards,
    );
  });
});
