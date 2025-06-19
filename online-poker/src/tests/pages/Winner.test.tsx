import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import Winner from "../../components/pages/Winner";
import { useGameDetails } from "../../context/GameContext";
import { useNavigate } from "react-router";

jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("../../context/GameContext");

describe("Winner Page", () => {
  const mockNavigate = jest.fn();
  const mockResetGame = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  const defaultMockData = {
    winnerName: "Player 1",
    winnerSpecialHand: "Royal Flush",
    allHands: [
      { playerName: "Player 1", rank: 9, handType: "Royal Flush", hand: ["AS", "KS", "QS", "JS", "TS"], playerIndex: 0 },
      { playerName: "Player 2", rank: 3, handType: "Pair", hand: ["2H", "2D", "3C", "4S", "5H"], playerIndex: 1 },
    ],
    resetGame: mockResetGame,
  };

  beforeEach(() => {
    (useGameDetails as jest.Mock).mockReturnValue(defaultMockData);
  });

  describe("Rendering", () => {
    test("should render winner page with correct structure", () => {
      render(<Winner />);

      expect(screen.getByText("Game Results")).toBeInTheDocument();
      expect(screen.getByText("Player 1 Wins!")).toBeInTheDocument();
      expect(screen.getByText("with Royal Flush")).toBeInTheDocument();
    });

    test("should display winner name and special hand", () => {
      render(<Winner />);

      expect(screen.getByText("Player 1")).toBeInTheDocument();
      expect(screen.getByText("with Royal Flush")).toBeInTheDocument();
    });

    test("should display all players' hands", () => {
      render(<Winner />);
  
      expect(screen.getByText("All Players Hands")).toBeInTheDocument();
      expect(screen.getByText("Player 1")).toBeInTheDocument();
      expect(screen.getByText("Royal Flush")).toBeInTheDocument();

      expect(screen.getByText("Player 2")).toBeInTheDocument();
      expect(screen.getByText("Pair")).toBeInTheDocument();
      const playerCards = screen.getAllByAltText(/card/);
      expect(playerCards.length).toBe(10); // 5 cards for each player
    });

    test("should display return home button", () => {
      render(<Winner />);

      const returnButton = screen.getByText("Return to Home");
      expect(returnButton).toBeInTheDocument();
    });
  });

  describe("Sorting Behavior", () => {
    test("should display winner first in hands list", () => {
      (useGameDetails as jest.Mock).mockReturnValue({
        ...defaultMockData,
        winnerName: "Player 2",
        allHands: [
          { playerName: "Player 1", rank: 3, handType: "Pair", hand: ["2H", "2D", "3C", "4S", "5H"], playerIndex: 0 },
          { playerName: "Player 2", rank: 9, handType: "Royal Flush", hand: ["AS", "KS", "QS", "JS", "TS"], playerIndex: 1 },
          { playerName: "Player 3", rank: 2, handType: "High Card", hand: ["7H", "9D", "JC", "KS", "AH"], playerIndex: 2 },
        ],
      });

      render(<Winner />);

      const playerHandCards = document.querySelectorAll('.player-hand-card');

      
      expect(playerHandCards[0]).toHaveClass('winner-hand');
      expect(playerHandCards[1]).toHaveClass('loser-hand');
      expect(playerHandCards[2]).toHaveClass('loser-hand');
    });

    test("should have correct CSS classes to winner and losers", () => {
      render(<Winner />);

      const winnerCard = document.querySelector('.winner-hand');
      const loserCard = document.querySelector('.loser-hand');

      expect(winnerCard).toBeInTheDocument();
      expect(loserCard).toBeInTheDocument();
    });
  });

  describe("Card Images", () => {
    test("should render correct card images with proper src paths", () => {
      render(<Winner />);

      const AS = screen.getByAltText("AS card");
      const KS = screen.getByAltText("KS card");

      expect(AS).toHaveAttribute("src", "/playing-cards/AS.svg");
      expect(KS).toHaveAttribute("src", "/playing-cards/KS.svg");
    });

    test("should have correct CSS class for card images", () => {
      render(<Winner />);

      const cardImages = document.querySelectorAll('.result-card-image');
      expect(cardImages.length).toBeGreaterThan(0);
      cardImages.forEach(img => {
        expect(img).toHaveClass('result-card-image');
      });
    });
  });

  describe("Navigation", () => {
    test("should navigate to home on return button click", async () => {
      render(<Winner />);

      const returnButton = screen.getByText("Return to Home");
      await fireEvent.click(returnButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    test("should call resetGame when returning home", async () => {
      render(<Winner />);

      const returnButton = screen.getByText("Return to Home");
      await fireEvent.click(returnButton);

      await waitFor(() => {
        expect(mockResetGame).toHaveBeenCalledTimes(1);
      });
    });

    test("should call resetGame before navigation", async () => {
      render(<Winner />);

      const returnButton = screen.getByText("Return to Home");
      await fireEvent.click(returnButton);

      await waitFor(() => {
        expect(mockResetGame).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Multiple Players", () => {
    test("should handle multiple players correctly", () => {
      (useGameDetails as jest.Mock).mockReturnValue({
        ...defaultMockData,
        allHands: [
          { playerName: "Ben", rank: 9, handType: "Royal Flush", hand: ["AS", "KS", "QS", "JS", "TS"], playerIndex: 0 },
          { playerName: "Katie", rank: 8, handType: "Straight Flush", hand: ["2H", "3H", "4H", "5H", "6H"], playerIndex: 1 },
          { playerName: "Rosa", rank: 7, handType: "Four of a Kind", hand: ["7C", "7D", "7H", "7S", "8C"], playerIndex: 2 },
          { playerName: "Caleb", rank: 1, handType: "High Card", hand: ["2D", "4C", "6S", "8H", "JC"], playerIndex: 3 },
        ],
        winnerName: "Ben",
      });

      render(<Winner />);

      expect(screen.getByText("Ben")).toBeInTheDocument();
      expect(screen.getByText("Katie")).toBeInTheDocument();
      expect(screen.getByText("Rosa")).toBeInTheDocument();
      expect(screen.getByText("Caleb")).toBeInTheDocument();

      const playerCards = screen.getAllByAltText(/card/);
      expect(playerCards.length).toBe(20); // 5 cards for 4 players
    });
  });
});