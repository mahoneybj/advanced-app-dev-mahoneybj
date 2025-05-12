import "../App.css";
import { useState, useEffect } from "react"; 
import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import Player from "./Player"; 

interface PlayersListProps {
  gameID?: string; 
}

const PlayersList: React.FC<PlayersListProps> = ({ gameID }) => {
  const [players, setPlayers] = useState<any[]>(); 
  const { getGameMembers } = useFirestoreFunctions();

  useEffect(() => {
    if (!gameID) return;
    
    const unsubscribe = getGameMembers(gameID, (members) => {
      setPlayers(members);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);


  return (
    <div className="player-content">
      {players?.map((player) => (
        <Player 
          key={player.id} 
          player={player.displayName} 
          id={player.id} 
        />
      ))}
    </div>
  );
};

export default PlayersList;
