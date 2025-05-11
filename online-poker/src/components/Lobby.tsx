import { useParams } from 'react-router';

const Lobby = () => {
  const { gameId } = useParams();
  return (
    <div>
      <h1>{gameId}</h1>
      <p>Welcome to the new game page!</p>
    </div>
  );
}
export default Lobby;