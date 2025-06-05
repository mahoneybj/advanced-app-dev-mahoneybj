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
import { useLoading } from "../context/IsLoadingContext";
import { useGameDetails } from "../context/GameContext";
import { cardRemove } from "../utils/cardRemove";
import useAsyncFunction from "./useAsyncFunction";
import toast from "react-hot-toast";

export function useFirestoreFunctions() {
  const { isLoading } = useLoading();
  const { user } = useAuth();
  const { gameID, cards, setGameState, setCards, setTurn } =
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

  const getGameMembers = (
    gameId: string,
    onUpdate: (members: any[]) => void,
  ) => {
    const unsubscribe = onSnapshot(
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
      },
    );

    return unsubscribe;
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

  const updateGameDoc = async (gameId: string, updates: any) => {
    return gameAsync.execute(
      async () => {
        updateDoc(doc(db, "games", gameId), {
          updates,
        });
      },
      {
        loadingMessage: "Starting game...",
        successMessage: "Game started successfully!",
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

  const watchGameState = (
    gameId: string,
    onUpdate: (gameState: string) => void,
  ) => {
    const unsubscribe = onSnapshot(
      doc(db, "games", gameId),
      (doc) => {
        const data = doc.data();
        if (data) {
          const { gameState } = data;
          onUpdate(gameState);
          setGameState(gameState);
        }
      },
      (error) => {
        toast.error(`Error fetching game state: ${error.message}`);
        console.error("Error fetching game state:", error);
      },
    );
    return unsubscribe;
  };

  const getPlayerCards = (
    gameId: string,
    onUpdate: (cards: string[]) => void,
  ) => {
    if (!user) {
      toast.error("You must be logged in to view your cards");
      return;
    }
    const unsubscribe = onSnapshot(
      doc(db, "games", gameId, "members", user.uid),
      (doc) => {
        const data = doc.data();
        if (data) {
          const { cards } = data;
          onUpdate(cards);
          setCards(cards);
        }
      },
      (error) => {
        toast.error(`Error fetching cards: ${error.message}`);
        console.error("Error fetching cards:", error);
      },
    );
    return unsubscribe;
  };

  const getGameState = (
    gameId: string,
    onUpdate: (gameState: string) => void,
  ) => {
    const unsubscribe = onSnapshot(
      doc(db, "games", gameId),
      (doc) => {
        const data = doc.data();
        if (data) {
          const { gameState } = data;
          onUpdate(gameState);
          setGameState(gameState);
        }
      },
      (error) => {
        toast.error(`Error fetching game state: ${error.message}`);
      },
    );
    return unsubscribe;
  };

  const getGameTurn = (
    gameId: string,
    userID: string,
    onUpdate: (turn: string) => void,
  ) => {
    const unsubscribe = onSnapshot(
      doc(db, "games", gameId),
      (doc) => {
        const data = doc.data();
        if (data) {
          const { currentTurn } = data;
          if (currentTurn === userID) {
            setTurn(true);
          } else {
            setTurn(false);
          }
          onUpdate(currentTurn);
        }
      },
      (error) => {
        toast.error(`Error fetching game turn: ${error.message}`);
      },
    );
    return unsubscribe;
  };

  /**
   * Handles the gameplay turn logic
   * Is passed the gameId and selectedCards
   * If selectedCards is empty, it will not exchange cards and skip turn
   * If selectedCards is not empty, it will exchange cards and update the game state
   * Checks if turns are over and will call calculate results function
   **/

  const getGameDetails = async (gameId: string) => {
    return gameAsync.execute(async () => {
      const gameDoc = await getDoc(doc(db, "games", gameId || gameID));
      if (!gameDoc.exists()) {
        throw new Error("Game not found");
      }
      const gameData = gameDoc.data();
      const { deck, deckIndex, turnOrder, turnIndex, playerCount } = gameData;

      return {
        deck,
        deckIndex,
        turnOrder,
        turnIndex,
        playerCount,
      };
    });
  };

  const gameplayTurnHandling = async (
    gameId: string,
    selectedCards: string[],
  ) => {
    if (!user) {
      toast.error("You must be logged in to exchange cards");
      return;
    }

    return gameAsync.execute(
      async () => {
        const gameDoc = await getDoc(doc(db, "games", gameId));
        if (!gameDoc.exists()) {
          throw new Error("Game not found");
        }
        const gameData = gameDoc.data();
        console.log("Game Data:", gameData);
        const { deck, deckIndex, turnOrder, turnIndex, playerCount } = gameData;

        const remainingCards = cardRemove(cards, selectedCards);

        const newCardsNeeded = selectedCards.length;

        const newCards = deck.slice(deckIndex, deckIndex + newCardsNeeded);

        const updatedCards = [...remainingCards, ...newCards];

        const newDeckIndex = deckIndex + newCardsNeeded;

        const nextTurnIndex = turnIndex + 1;
        let nextPlayerId;
        let nextPlayerName;
        let gameState;

        if (nextTurnIndex >= playerCount) {
          nextPlayerId = "";
          nextPlayerName = "";
          gameState = "Calculating results"; // ADD CALL TO NEW FUNCTION
          setGameState(`Calculating results`);
        } else {
          nextPlayerId = turnOrder[nextTurnIndex];
          const nextPlayerDoc = await getDoc(
            doc(db, "games", gameId, "members", nextPlayerId),
          );
          nextPlayerName = nextPlayerDoc.data()?.displayName || "Next player";
          gameState = `${nextPlayerName}'s turn`;
          setGameState(`${nextPlayerName}'s turn`);
        }

        const updates = [
          updateDoc(doc(db, "games", gameId, "members", user.uid), {
            cards: updatedCards,
          }),

          updateDoc(doc(db, "games", gameId), {
            deckIndex: newDeckIndex,
            currentTurn: nextPlayerId,
            turnIndex: nextTurnIndex,
            gameState: gameState,
          }),
        ];

        await Promise.all(updates);

        setCards(updatedCards);
        setTurn(false);

        return gameId;
      },
      {
        loadingMessage: "Exchanging cards...",
        successMessage: "Cards exchanged successfully!",
        errorMessage: "Failed to exchange cards",
      },
    );
  };

  return {
    getGameMembers,
    watchGameState,
    getPlayerCards,
    getGameState,
    getGameTurn,
    getGameDetails,
    gameplayTurnHandling,
    isLoading,
    
//Important VVV
    updateGameDoc,
    updateMembersDoc,
    getMembers,
    deleteMemberDoc,
    createGameDoc,
    setGameDoc,
  };
}
