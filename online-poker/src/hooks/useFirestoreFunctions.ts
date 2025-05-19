import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  increment,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/FirebaseAuthContext";
import { useLoading } from "../context/IsLoadingContext";
import { useGameDetails } from "../context/GameContext";
import { deckShuffle } from "../utils/deckShuffle";
import useAsyncFunction from "./useAsyncFunction";
import toast from "react-hot-toast";

export function useFirestoreFunctions() {
  const { isLoading } = useLoading();
  const { user } = useAuth();
  const { gameID, setGameID } = useGameDetails();
  const { gameState, setGameState } = useGameDetails();
  const { cards, setCards } = useGameDetails();

  const gameAsync = useAsyncFunction<any>();

  /* Firestore methods */
  const createGame = async (ownerUID: string) => {
    if (!user) {
      toast.error("You must be logged in to create a game");
      return;
    }
    return gameAsync.execute(
      async () => {
        const deck = deckShuffle();
        const docRef = await addDoc(collection(db, "games"), {
          ownerUID,
          deck: deck,
          deckIndex: 0,
          gameState: "waiting",
          playerCount: 1,
        });

        const gameId = docRef.id;

        await setDoc(doc(db, "games", gameId, "members", ownerUID), {
          displayName: user.displayName || "Anonymous Player",
          isHost: true,
        });
        setGameID(gameId); // Set the game ID in the context

        return docRef;
      },
      {
        loadingMessage: "Creating game...",
        successMessage: "Game created successfully!",
        errorMessage: "Failed to create game",
      },
    );
  };

  const joinGame = async (gameId: string) => {
    if (!user) {
      toast.error("You must be logged in to join a game");
      return;
    }

    if (!gameId) {
      toast.error("Please enter a game ID");
      return;
    }

    return gameAsync.execute(
      async () => {
        const gameDoc = await getDoc(doc(db, "games", gameId));
        if (!gameDoc.exists()) {
          throw new Error("Game not found");
        }

        const memberDoc = await getDoc(
          doc(db, "games", gameId, "members", user.uid),
        );
        if (memberDoc.exists()) {
          toast.error("You're already in this game");
          return gameId;
        }

        await setDoc(doc(db, "games", gameId, "members", user.uid), {
          displayName: user.displayName || "Anonymous Player",
        });

        await updateDoc(doc(db, "games", gameId), {
          playerCount: increment(1),
        });
        setGameID(gameId); // Set the game ID in the context *** Investigate if this wil add gameID to the context even if join fails
        return gameId;
      },
      {
        loadingMessage: "Joining game...",
        successMessage: "Game joined successfully!",
        errorMessage: "Failed to join game",
      },
    );
  };

  const leaveGame = async () => {
    if (!user) {
      toast.error("You must be logged in to join a game");
      return;
    }

    return gameAsync.execute(
      async () => {
        await deleteDoc(doc(db, "games", gameID, "members", user.uid));

        await updateDoc(doc(db, "games", gameID), {
          playerCount: increment(-1),
        });
        setGameID("");
      },
      {
        loadingMessage: "Leaving game...",
        successMessage: "Game left successfully!",
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

  const gameStart = async () => {
    return gameAsync.execute(
      async () => {
        const gameDoc = await getDoc(doc(db, "games", gameID));
        if (!gameDoc.exists()) {
          throw new Error("Game not found");
        }

        // Getting game data for deck and index
        const gameData = gameDoc.data();
        const { deck, deckIndex } = gameData;

        // Getting members
        const membersSnapshot = await getDocs(
          collection(db, "games", gameID, "members"),
        );
        const members = membersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        let currentDeckIndex = deckIndex || 0;
        const updates = [];

        // Deal 5 cards to each player
        for (const member of members) {
          const playerCards = deck.slice(
            currentDeckIndex,
            currentDeckIndex + 5,
          );
          currentDeckIndex += 5;

          // Add update operation to our batch
          updates.push(
            updateDoc(doc(db, "games", gameID, "members", member.id), {
              cards: playerCards,
            }),
          );
          setCards(playerCards);
        }

        // Update the game's deck index
        updates.push(
          updateDoc(doc(db, "games", gameID), {
            deckIndex: currentDeckIndex,
            gameState: "playing",
          }),
        );

        await Promise.all(updates);

        setGameState("playing");
        return gameID;
      },
      {
        loadingMessage: "Starting game...",
        successMessage: "Game started successfully!",
        errorMessage: "Failed to start game",
      },
    );
  };

  const watchGameState = (onUpdate: (gameState: string) => void) => {
    const unsubscribe = onSnapshot(
      doc(db, "games", gameID),
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

  const getPlayerCards = async () => {
    if (!user || !gameID) {
      return [];
    }

    try {
      const memberDoc = await getDoc(
        doc(db, "games", gameID, "members", user.uid),
      );
      if (memberDoc.exists()) {
        const memberData = memberDoc.data();
        if (memberData.cards) {
          setCards(memberData.cards);
          return memberData.cards;
        }
      }
      return [];
    } catch (error) {
      console.error("Error fetching player cards:", error);
      toast.error("Failed to fetch your cards");
      return [];
    }
  };

  return {
    createGame,
    joinGame,
    leaveGame,
    getGameMembers,
    gameStart,
    watchGameState,
    getPlayerCards,
    isLoading,
  };
}
