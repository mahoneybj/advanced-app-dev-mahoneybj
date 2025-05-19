import { useGameDetails } from "../context/GameContext";

const CardsList = () => {
    const { cards } = useGameDetails();
    
    return (
        <div className="cards-list">
            {cards.map((card, index) => (
                <div key={index} className="card-container">
                    <img 
                        src={`/playing-cards/${card}.svg`} 
                        alt={`${card} card`} 
                        className="card-image" 
                    />
                </div>
            ))}
        </div>
    );
}

export default CardsList;