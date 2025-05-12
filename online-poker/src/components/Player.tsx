import "../App.css";


interface PlayerProps {
    player: string;
    id: string;
}

const Player: React.FC<PlayerProps> = (player) => {
    return (
        <>
            <div className="player">
                <p>Player ID: {player.id}</p>
                <p>Player Name: {player.player}</p>
            </div>
        </>
    );
};
  
export default Player;
