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

export function useFirestoreFunctions() {
  const { user } = useAuth();
  const {
    gameID,
    setGameState,
    setCards,
    setTurn,
    setWinnerID,
    setGameEnded,
    setWinnerName,
    setGameID,
  } = useGameDetails();

  const createGameDoc = async (gameData: any) => {
    return await addDoc(collection(db, "games"), gameData);
  };

  const setGameDoc = async (gameId: string, uid: string, gameData: any) => {
    await setDoc(doc(db, "games", gameId, "members", uid), gameData);
  };

  const deleteMemberDoc = async (gameId: string, memberId: string) => {
    await deleteDoc(doc(db, "games", gameId, "members", memberId));
  };

  const getMembers = async (gameId: string) => {
    const membersSnapshot = await getDocs(
      collection(db, "games", gameId, "members"),
    );
    const members = membersSnapshot.docs.map((doc) => ({
      id: doc.id,
      displayName: doc.data().displayName,
      ...doc.data(),
    }));
    return members;
  };

  const getMember = async (gameId: string, memberID: string) => {
    const memberDoc = await getDoc(
      doc(db, "games", gameId, "members", memberID),
    );

    if (!memberDoc.exists()) {
      throw new Error("Member not found");
    }

    return {
      ...memberDoc.data(),
    };
  };

  const updateGameDoc = async (gameId: string, updates: any) => {
    await updateDoc(doc(db, "games", gameId), updates);
  };

  const updateMembersDoc = async (
    gameId: string,
    memberId: string,
    updates: any,
  ) => {
    await updateDoc(doc(db, "games", gameId, "members", memberId), {
      ...updates,
    });
  };

  const watchGameDetails = (
    gameId: string,
    onUpdate: (gameDetails: any) => void,
  ) => {
    const unsubscribe = onSnapshot(
      doc(db, "games", gameId),
      (docSnapshot) => {
        const data = docSnapshot.data();
        if (data) {
          setGameState(data.gameState);
          setWinnerID(data.winner);
          setWinnerName(data.winnerName || "");
          setGameEnded(data.gameEnded || false);
          setGameID(docSnapshot.id);

          if (user) {
            setTurn(data.currentTurn === user.uid);
          }
          onUpdate(data);
        }
      },
      (error) => {
        console.error("Error fetching game details:", error);
        throw error;
      },
    );
    return unsubscribe;
  };

  const watchGameMembers = (
    gameId: string,
    onUpdate: (members: any[]) => void,
  ) => {
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
        console.error("Error fetching game members:", error);
        throw error;
      },
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
          console.error("Error fetching player cards:", error);
          throw error;
        },
      );
    }

    return () => {
      membersUnsubscribe();
      cardsUnsubscribe();
    };
  };

  const getGameDetails = async (gameId: string) => {
    const gameDoc = await getDoc(doc(db, "games", gameId || gameID));
    if (!gameDoc.exists()) {
      throw new Error("Game not found");
    }
    const gameData = gameDoc.data();
    const { deck, deckIndex, turnOrder, turnIndex, playerCount, gameState, ownerUID } =
      gameData;

    return {
      deck,
      deckIndex,
      turnOrder,
      turnIndex,
      playerCount,
      gameState,
      ownerUID,
    };
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
