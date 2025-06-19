import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import Winner from "../../components/pages/Winner";
import { useGameDetails } from "../../context/GameContext";
import { useNavigate } from "react-router";



jest.mock("react-router", () => ({
  useNavigate: jest.fn(),
}));
jest.mock("../../context/GameContext");

describe("Winner Page", () => {
      const mockNavigate = jest.fn();
    
  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);

    (useGameDetails as jest.Mock).mockReturnValue({
      winnerName: "Player 1",
      winnerSpecialHand: "Royal Flush",
        allHands: [
            { playerName: "Player 1", rank: 9, handType: "Royal Flush", hand: ["AS", "KS", "QS", "JS", "TS"], playerIndex: 0 },
            { playerName: "Player 2", rank: 3, handType: "Pair", hand: ["2H", "2D", "3C", "4S", "5H"], playerIndex: 1 },
        ],
    });
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
});