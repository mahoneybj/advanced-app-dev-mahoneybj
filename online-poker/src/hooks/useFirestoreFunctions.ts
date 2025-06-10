import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/FirebaseAuthContext";
import { useGameDetails } from "../context/GameContext";
import useAsyncFunction from "./useAsyncFunction";
import toast from "react-hot-toast";

export function useFirestoreFunctions() {
  const { user } = useAuth();
  const { gameID, setGameState, setCards, setTurn, setWinnerID, setGameEnded, setWinnerName } =
    useGameDetails();

  const gameAsync = useAsyncFunction<any>();

  const createGameDoc = async (gameData: any) => {
    return gameAsync.execute(
      async () => {
        return await addDoc(collection(db, "games"), gameData);
      },
      {
        loadingMessage: "Creating game...",
        successMessage: "Game created successfully!",
        errorMessage: "Failed to create game",
      },
    );
  };

  const setGameDoc = async (
    gameId: string,
    uid: string,
    gameData: any,
  ) => {
    return gameAsync.execute(
      async () => {
        await setDoc(doc(db, "games", gameId, "members", uid), gameData);
      },
      {
        loadingMessage: "Creating game...",
        successMessage: "Game created successfully!",
        errorMessage: "Failed to create game",
      },
    );
  };

  const deleteMemberDoc = async (gameId: string, memberId: string) => {
    return gameAsync.execute(
      async () => {
        await deleteDoc(doc(db, "games", gameId, "members", memberId));
      },
      {
        loadingMessage: "Leaving game...",
        successMessage: "Left game successfully!",
        errorMessage: "Failed to leave game",
      },
    );
  };

  const getMembers = async (gameId: string) => {
    return gameAsync.execute(
      async () => {
        const membersSnapshot = await getDocs(
          collection(db, "games", gameId, "members"),
        );
        const members = membersSnapshot.docs.map((doc) => ({
          id: doc.id,
          displayName: doc.data().displayName,
          ...doc.data(),
        }));
        return members;
      },
      {
        loadingMessage: "Fetching game members...",
        successMessage: "Game members fetched successfully!",
        errorMessage: "Failed to fetch game members",
      },
    );
  };

  const getMember = async (gameId: string, memberID: string) => {
    return gameAsync.execute(
      async () => {
        const memberDoc = await getDoc(
        doc(db, "games", gameId, "members", memberID)
      );

      if (!memberDoc.exists()) {
        throw new Error("Member not found");
      }

      return {
        ...memberDoc.data()
      };
      },
      {
        loadingMessage: "Fetching game member...",
        successMessage: "Game member fetched successfully!",
        errorMessage: "Failed to fetch game members",
      },
    );
  };

  const updateGameDoc = async (gameId: string, updates: any) => {
  return gameAsync.execute(
    async () => {
      updateDoc(doc(db, "games", gameId), updates);
    },
    {
      loadingMessage: "ADD BETTER LOADING MESSAGE HERE...",
      successMessage: "ADD BETTER SUCCESS MESSAGE HERE...",
      errorMessage: "Failed to start game",
    },
  );
};

  const updateMembersDoc = async (
    gameId: string,
    memberId: string, 
    updates: any,
  ) => {
    return gameAsync.execute(
      async () => {
        updateDoc(doc(db, "games", gameId, "members", memberId), {
          ...updates, 
        });
      },
      {
        loadingMessage: "Dealing cards...",
        successMessage: "Cards dealt successfully!",
        errorMessage: "Failed to deal cards",
      },
    );
  };


  const watchGameDetails = (gameId: string, onUpdate: (gameDetails: any) => void) => {
    const unsubscribe = onSnapshot(
      doc(db, "games", gameId),
      (docSnapshot) => {
        const data = docSnapshot.data();
        if (data) {
          setGameState(data.gameState);
          setWinnerID(data.winner);
          setWinnerName(data.winnerName || "");
          setGameEnded(data.gameEnded || false);
          
          if (user) {
            setTurn(data.currentTurn === user.uid);
          }
          onUpdate(data);
        }
      },
      (error) => {
        toast.error(`Error fetching game details: ${error.message}`);
        console.error("Error fetching game details:", error);
      }
    );
    return unsubscribe;
  };

    const watchGameMembers = (gameId: string, onUpdate: (members: any[]) => void) => {
    const membersUnsubscribe = onSnapshot(
      collection(db, "games", gameId, "members"),
      (snapshot) => {
        const members = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        onUpdate(members);
      },
      (error) => {
        toast.error(`Error fetching game members: ${error.message}`);
        console.error("Error fetching game members:", error);
      }
    );
    let cardsUnsubscribe = () => {};
    if (user) {
      cardsUnsubscribe = onSnapshot(
        doc(db, "games", gameId, "members", user.uid),
        (docSnapshot) => {
          const data = docSnapshot.data();
          if (data && data.cards) {
            setCards(data.cards);
          }
        },
        (error) => {
          toast.error(`Error fetching player cards: ${error.message}`);
          console.error("Error fetching player cards:", error);
        }
      );
    }
    
    return () => {
      membersUnsubscribe();
      cardsUnsubscribe();
    };
  };

  const getGameDetails = async (gameId: string) => {
    return gameAsync.execute(async () => {
      const gameDoc = await getDoc(doc(db, "games", gameId || gameID));
      if (!gameDoc.exists()) {
        throw new Error("Game not found");
      }
      const gameData = gameDoc.data();
      const { deck, deckIndex, turnOrder, turnIndex, playerCount, gameState } = gameData;

      return {
        deck,
        deckIndex,
        turnOrder,
        turnIndex,
        playerCount,
        gameState
      };
    });
  };



  return {
    watchGameDetails,
    getGameDetails,
    watchGameMembers,
    updateGameDoc,
    updateMembersDoc,
    getMembers,
    getMember,
    deleteMemberDoc,
    createGameDoc,
    setGameDoc,
  };
}
