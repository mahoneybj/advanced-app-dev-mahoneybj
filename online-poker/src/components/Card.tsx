interface CardProps {
  card: string;
  isSelected: boolean;
  turn: boolean;
  onSelect: (card: string, isSelected: boolean) => void;
}

const Card = ({ card, isSelected, onSelect, turn }: CardProps) => {
  const handleToggleSelection = () => {
    onSelect(card, !isSelected);
  };

  return (
    <div className="card-container">
      <div className={`card ${isSelected ? 'selected' : ''}`}>
        <img
          src={`/playing-cards/${card}.svg`}
          alt={`${card} card`}
          className="card-image"
          onClick={handleToggleSelection}
          style={{ cursor: 'pointer' }}
        />
        {turn && (
          <div className="card-selection">
        <input 
          type="checkbox" 
          checked={isSelected}
          onChange={handleToggleSelection}
          id={`card-${card}`}
        />
          </div>
        )}
      </div>
    </div>
  );
};

export default Card;