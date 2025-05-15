import PlayerList from '../PlayersList';
import { useFirestoreFunctions } from '../../hooks/useFirestoreFunctions';
import { useGameDetails } from "../../context/GameContext";
import { useNavigate } from 'react-router';
import { useEffect } from 'react';

const Lobby = () => {
  const { leaveGame } = useFirestoreFunctions();
  const { gameID } = useGameDetails();
  const navigate = useNavigate();

  const handleLeaveGame = async () => {
    await leaveGame();
  };

    useEffect(() => {
      if(!gameID) {
        navigate(`/`);
      }
    }
    , [gameID, navigate]);
  
  return (
    <div className="lobby-container">
      <div className="lobby-header">
        <button className="Leave-game-btn" onClick={handleLeaveGame}>Leave Game</button>
        <h1>Welcome to your poker lobby!</h1>
        <h3>Share your Game ID for friends to join: <span className="game-id">{gameID}</span></h3>
      </div>
      <div className="players-list">
        <h3>Players</h3>
        <PlayerList gameID={gameID} />
      </div>
    </div>
  );
}
export default Lobby;