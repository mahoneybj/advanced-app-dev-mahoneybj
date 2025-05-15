import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, setDoc, getDoc, increment } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/FirebaseAuthContext";
import { useLoading } from "../context/IsLoadingContext";
import { useGameDetails } from "../context/GameContext";
import useAsyncFunction from "./useAsyncFunction";
import toast from 'react-hot-toast'; 


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
        const docRef = await addDoc(collection(db, "games"), {
          ownerUID,
          gameState: "waiting",
          playerCount: 1
        });
        
        const gameId = docRef.id;

        await setDoc(doc(db, "games", gameId, "members", ownerUID), {
          displayName: user.displayName || "Anonymous Player",
          isHost: true
        });
        setGameID(gameId); // Set the game ID in the context

        return docRef;
      },
      {
        loadingMessage: 'Creating game...',
        successMessage: 'Game created successfully!',
        errorMessage: 'Failed to create game'
      }
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
      
      const memberDoc = await getDoc(doc(db, "games", gameId, "members", user.uid));
      if (memberDoc.exists()) {
        toast.error("You're already in this game");
        return  gameId;
      }
      
      await setDoc(doc(db, "games", gameId, "members", user.uid), {
        displayName: user.displayName || "Anonymous Player"
      });
      
      await updateDoc(doc(db, "games", gameId), {
        playerCount: increment(1)
      });
      setGameID(gameId) // Set the game ID in the context *** Investigate if this wil add gameID to the context even if join fails
      return gameId;
    },
    {
      loadingMessage: 'Joining game...',
      successMessage: 'Game joined successfully!',
      errorMessage: 'Failed to join game'
    }
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
          playerCount: increment(-1)
        });
        setGameID(""); 
      },
      {
        loadingMessage: 'Leaving game...',
        successMessage: 'Game left successfully!',
        errorMessage: 'Failed to leave game'
      }
      );
    };

  const getGameMembers = (gameId: string, onUpdate: (members: any[]) => void) => {
  const unsubscribe = onSnapshot(
    collection(db, "games", gameId, "members"),
    (snapshot) => {
      const members = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      onUpdate(members);
    },
    (error) => {
      toast.error(`Error fetching game members: ${error.message}`);
      console.error("Error fetching game members:", error);
    }
  );
  
  return unsubscribe;
};

const gameStart = async () => {
  return gameAsync.execute(
    async () => {
      await updateDoc(doc(db, "games", gameID), {
        gameState: "playing"
      });
      setGameState("playing");
      return gameID;
    },
    {
      loadingMessage: 'Starting game...',
      successMessage: 'Game started successfully!',
      errorMessage: 'Failed to start game'
    }
  );
};




  const getTodos = (onUpdate: (todos: { todo: string; id: string }[]) => void) => {
    if (!user) {
      toast.error("You must be logged in to access todos");
      return () => {};
    }
    
    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "todos"), 
      (snapshot) => {
        const firebaseData = snapshot.docs.map((doc) => ({
          todo: doc.data().todo,
          id: doc.id,
        }));
        onUpdate(firebaseData);
      },
      (error) => {
        toast.error(`Error fetching todos: ${error.message}`);
        console.error("Error fetching todos:", error);
      }
    );
    return unsubscribe;
  };

  const addTodo = async (todo: string, e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to add todos");
      return;
    }

    if (!todo) {
      toast.error("Todo can't be blank");
      return;
    }
    
    return gameAsync.execute(
      async () => {
        const docRef = await addDoc(collection(db, "users", user.uid, "todos"), { todo });
        console.log("Document written with ID: ", docRef.id);
        return docRef;
      },
      {
        loadingMessage: 'Adding todo...',
        successMessage: 'Todo added successfully!',
        errorMessage: 'Failed to add todo'
      }
    );
  };

  const deleteTodo = async (todoId: string) => {
    if (!user) {
      toast.error("You must be logged in to delete todos");
      return;
    }
    
    return gameAsync.execute(
      async () => {
        await deleteDoc(doc(db, "users", user.uid, "todos", todoId));
        return todoId;
      },
      {
        loadingMessage: 'Deleting todo...',
        successMessage: 'Todo deleted successfully!',
        errorMessage: 'Failed to delete todo'
      }
    );
  };

  const updateTodo = async (todoId: string, todoEdit: string, e?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (e) e.preventDefault();
    
    if (!user) {
      toast.error("You must be logged in to update todos");
      return;
    }
    if (!todoEdit) {
      toast.error("Todo can't be blank");
      return;
    }
    
    return gameAsync.execute(
      async () => {
        await updateDoc(doc(db, "users", user.uid, "todos", todoId), { todo: todoEdit });
        return todoId;
      },
      {
        loadingMessage: 'Updating todo...',
        successMessage: 'Todo updated successfully!',
        errorMessage: 'Failed to update todo'
      }
    );
  };

  return {
    createGame,
    joinGame,
    leaveGame,
    getGameMembers,
    gameStart,
    addTodo,
    deleteTodo,
    updateTodo,
    getTodos,
    isLoading,
  };
}