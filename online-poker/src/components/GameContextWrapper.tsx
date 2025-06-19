import React, { useEffect, ReactNode, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../context/FirebaseAuthContext";
import { useGameDetails } from "../context/GameContext";
import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import SplashScreen from "./pages/SplashScreen";

interface GameContextWrapperProps {
  children: ReactNode;
}

// GameContextWrapper wraps the game context and handles reloads to ensure the game details and members are loaded correctly
// Having this wapper removes the need for the useGameDetails hook in every component that needs game details
const GameContextWrapper: React.FC<GameContextWrapperProps> = ({
  children,
}) => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const { setGameID } = useGameDetails();
  const { watchGameDetails, watchGameMembers } = useFirestoreFunctions();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (gameId && user) {
      setGameID(gameId);

      let detailsLoaded = false;
      let membersLoaded = false;

      // Possable issue caused by race condition but may have been in join game hook, keeping just in case
      const checkIfReady = () => {
        if (detailsLoaded && membersLoaded) {
          setTimeout(() => {
            setIsLoading(false);
          }, 500);
        }
      };

      const unsubscribeDetails = watchGameDetails(gameId, () => {
        detailsLoaded = true;
        checkIfReady();
      });

      const unsubscribeMembers = watchGameMembers(gameId, () => {
        membersLoaded = true;
        checkIfReady();
      });

      return () => {
        unsubscribeDetails?.();
        unsubscribeMembers?.();
      };
    }
  }, [gameId, user]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return <>{children}</>;
};

export default GameContextWrapper;
