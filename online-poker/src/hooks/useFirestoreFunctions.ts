import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/FirebaseAuthContext";
import { useLoading } from "../context/IsLoadingContext";
import { useState, useCallback } from 'react';
import useAsyncFunction from "./useAsyncFunction";
import toast from 'react-hot-toast'; 


export function useFirestoreFunctions() {
  const { isLoading } = useLoading();
  const { user } = useAuth();
  
  const todoAsync = useAsyncFunction<any>();

  /* Firestore docs methods */
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
    
    return todoAsync.execute(
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
    
    return todoAsync.execute(
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
    
    return todoAsync.execute(
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
    addTodo,
    deleteTodo,
    updateTodo,
    getTodos,
    isLoading,
    todoError: todoAsync.error,
  };
}