import { useParams } from 'react-router';
import PlayerList from '../PlayersList';

const Lobby = () => {
  const { gameId } = useParams();

  return (
    <div>
      <h1>Welcome to your poker lobby!</h1>
      <h3>Share your Game ID for friends to join: {gameId}</h3>
      <div>
        <p>Players:</p>
        <PlayerList gameID={gameId} />
      </div>
    </div>
  );
}
export default Lobby;