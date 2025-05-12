import { useParams } from 'react-router';
import PlayerList from '../PlayersList';

const Lobby = () => {
  const { gameId } = useParams();

  return (
    <div>
      <h1>{gameId}</h1>
      <p>Welcome to the new game page!</p>
      <div>
        <p>Here you can see the players in the game.</p>
        <PlayerList gameID={gameId} />
      </div>
    </div>
  );
}
export default Lobby;