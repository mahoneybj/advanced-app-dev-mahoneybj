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
import { cardRemove } from "../utils/cardRemove";
import useAsyncFunction from "./useAsyncFunction";
import toast from "react-hot-toast";

export function useFirestoreFunctions() {
  const { isLoading } = useLoading();
  const { user } = useAuth();
  const { gameID, cards, setGameID, setGameState, setCards, setTurn } = useGameDetails();

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
          gameState: "Waiting",
          currentTurn: "",  
          turnOrder: [], 
          turnIndex: 0,
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

        if (gameDoc.data().gameState !== "Waiting") {
          toast.error("Game is already in progress");
          return;
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

  const gameStart = async (gameId: string) => {
    return gameAsync.execute(
      async () => {
        const gameDoc = await getDoc(doc(db, "games", gameId));
        if (!gameDoc.exists()) {
          throw new Error("Game not found");
        }

        // Getting game data for deck and index
        const gameData = gameDoc.data();
        const { deck, deckIndex, turnIndex } = gameData;

        // Getting members
        const membersSnapshot = await getDocs(
          collection(db, "games", gameId, "members"),
        );
        const members = membersSnapshot.docs.map((doc) => ({
          id: doc.id,
          displayName: doc.data().displayName,
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
            updateDoc(doc(db, "games", gameId, "members", member.id), {
              cards: playerCards,
            }),
          );
          setCards(playerCards);
        }

        // Set the first player as the current turn and create turn order
        const memberIds = members.map(member => member.id);
        const firstPlayer = memberIds[0];
        
        const playerName = members.map(member => member.displayName); // THIS COULD BE IMPROVED
        const firstPlayerName = playerName[0]; 

        updates.push(
          updateDoc(doc(db, "games", gameId), {
            currentTurn: firstPlayer,
            turnOrder: memberIds,
            turnIndex: increment(1),
          }),
        );

        // Update the game's deck index
        updates.push(
          updateDoc(doc(db, "games", gameId), {
            deckIndex: currentDeckIndex,
            gameState: `${firstPlayerName}'s turn`, // NEED TO ADD USERNAME
          }),
        );

        await Promise.all(updates);

        setGameState(`${firstPlayerName}'s turn`); 
        return gameId;
      },
      {
        loadingMessage: "Starting game...",
        successMessage: "Game started successfully!",
        errorMessage: "Failed to start game",
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

  const getGameState = (gameId: string, onUpdate: (gameState: string) => void, ) =>{
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

  const getGameTurn = (gameId: string, userID: string, onUpdate: (turn: string) => void, ) =>{
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

  const cardExchange = async (gameId: string, selectedCards: string[]) => {
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
        
        const newCards = deck.slice(
          deckIndex,
          deckIndex + newCardsNeeded
        );
        
        const updatedCards = [...remainingCards, ...newCards];
        
        const newDeckIndex = deckIndex + newCardsNeeded;
        
        const nextTurnIndex = (turnIndex + 1) % playerCount;
        const nextPlayerId = turnOrder[nextTurnIndex];
        
        const nextPlayerDoc = await getDoc(doc(db, "games", gameId, "members", nextPlayerId));
        const nextPlayerName = nextPlayerDoc.data()?.displayName || "Next player";
        
        const updates = [
          updateDoc(doc(db, "games", gameId, "members", user.uid), {
            cards: updatedCards,
          }),
          
          updateDoc(doc(db, "games", gameId), {
            deckIndex: newDeckIndex,
            currentTurn: nextPlayerId,
            turnIndex: nextTurnIndex,
            gameState: `${nextPlayerName}'s turn`,
          })
        ];
        
        await Promise.all(updates);
        
        setCards(updatedCards);
        setTurn(false); 
        setGameState(`${nextPlayerName}'s turn`);
        
        return gameId;
      },
      {
        loadingMessage: "Exchanging cards...",
        successMessage: "Cards exchanged successfully!",
        errorMessage: "Failed to exchange cards",
      },
    );
  }

  return {
    createGame,
    joinGame,
    leaveGame,
    getGameMembers,
    gameStart,
    watchGameState,
    getPlayerCards,
    getGameState,
    getGameTurn,
    cardExchange,
    isLoading,
  };
}
