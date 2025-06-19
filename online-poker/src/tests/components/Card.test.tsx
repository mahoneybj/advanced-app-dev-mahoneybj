import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import Card from "../../components/Card";
import { useLoading } from "../../context/IsLoadingContext";

jest.mock("../../context/IsLoadingContext");

describe("Card Component", () => {
  const mockOnSelect = jest.fn();
  const defaultProps = {
    card: "2H",
    isSelected: false,
    turn: true,
    onSelect: mockOnSelect,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useLoading as jest.Mock).mockReturnValue({
      isLoading: false,
    });
  });

  test("should render card image with correct src and alt", () => {
    render(<Card {...defaultProps} />);

    const cardImage = screen.getByAltText("2H card");
    expect(cardImage).toBeInTheDocument();
    expect(cardImage).toHaveAttribute("src", "/playing-cards/2H.svg");
    expect(cardImage).toHaveClass("card-image");
  });

  test("should render with correct CSS classes when not selected", () => {
    render(<Card {...defaultProps} />);

    const cardDiv = screen.getByAltText("2H card").closest(".card");
    expect(cardDiv).toHaveClass("card");
    expect(cardDiv).not.toHaveClass("selected");
  });

  test("should render with selected class when isSelected is true", () => {
    render(<Card {...defaultProps} isSelected={true} />);

    const cardDiv = screen.getByAltText("2H card").closest(".card");
    expect(cardDiv).toHaveClass("card", "selected");
  });

  test("should show checkbox when it's player's turn", () => {
    render(<Card {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute("id", "card-2H");
    expect(checkbox).not.toBeChecked();
  });

  test("should not show checkbox when it's not player's turn", () => {
    render(<Card {...defaultProps} turn={false} />);

    const checkbox = screen.queryByRole("checkbox");
    expect(checkbox).not.toBeInTheDocument();
  });

  test("should show checked checkbox when card is selected", () => {
    render(<Card {...defaultProps} isSelected={true} />);

    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  test("should call onSelect when card image is clicked during player's turn", () => {
    render(<Card {...defaultProps} />);

    const cardImage = screen.getByAltText("2H card");
    fireEvent.click(cardImage);

    expect(mockOnSelect).toHaveBeenCalledWith("2H", true);
  });

  test("should call onSelect when checkbox is changed during player's turn", () => {
    render(<Card {...defaultProps} />);

    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);

    expect(mockOnSelect).toHaveBeenCalledWith("2H", true);
  });

  test("should not call onSelect when card image is clicked and not player's turn", () => {
    render(<Card {...defaultProps} turn={false} />);

    const cardImage = screen.getByAltText("2H card");
    fireEvent.click(cardImage);

    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  test("should call onSelect with false when selected card is clicked when already true", () => {
    render(<Card {...defaultProps} isSelected={true} />);

    const cardImage = screen.getByAltText("2H card");
    fireEvent.click(cardImage);

    expect(mockOnSelect).toHaveBeenCalledWith("2H", false);
  });
});
