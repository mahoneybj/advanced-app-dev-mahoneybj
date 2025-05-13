import { useParams } from 'react-router';
import PlayerList from '../PlayersList';
import { useGameDetails } from '../../context/GameContext';

const Lobby = () => {
  const { gameId } = useParams();
  

  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <h1>Welcome to your poker lobby!</h1>
        <h3>Share your Game ID for friends to join: <span className="game-id">{gameId}</span></h3>
      </div>
      <div className="players-list">
        <h3>Players</h3>
        <PlayerList gameID={gameId} />
      </div>
    </div>
  );
}
export default Lobby;