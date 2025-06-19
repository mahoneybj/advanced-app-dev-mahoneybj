import React, { useEffect, ReactNode, useState } from "react";
import { useParams } from "react-router";
import { useAuth } from "../context/FirebaseAuthContext";
import { useGameDetails } from "../context/GameContext";
import { useFirestoreFunctions } from "../hooks/useFirestoreFunctions";
import SplashScreen from "./pages/SplashScreen";

interface GameContextWrapperProps {
  children: ReactNode;
}

const GameContextWrapper: React.FC<GameContextWrapperProps> = ({
  children,
}) => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useAuth();
  const { gameID, setGameID } = useGameDetails();
  const { watchGameDetails, watchGameMembers } = useFirestoreFunctions();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (gameId && user) {
      setGameID(gameId);

      const unsubscribeDetails = watchGameDetails(gameId, () => {
        // Set loading to false after first data fetch
        setIsLoading(false);
      });

      const unsubscribeMembers = watchGameMembers(gameId, () => {});

      return () => {
        unsubscribeDetails?.();
        unsubscribeMembers?.();
      };
    }
  }, [gameId, user]);

  if (isLoading) {
    return (
        <SplashScreen />
    );
  }

  return <>{children}</>;
};

export default GameContextWrapper;
