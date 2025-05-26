import {
  getAuth,
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useLoading } from "../context/IsLoadingContext";
import { toast } from "react-hot-toast";
import useAsyncFunction from "./useAsyncFunction";

export function useFirebaseAuth() {
  const { isLoading } = useLoading();

  // Create async function handlers
  const authAsync = useAsyncFunction<any>();

  /* Firebase auth methods */
  const signInAnonymous = async (username: string) => {
    if (!username) {
      toast.error("Username is required");
      return;
    }
    return authAsync.execute(
      async () => {
        const auth = getAuth();
        const anonymousUser = await signInAnonymously(auth);

        await updateProfile(anonymousUser.user, {
          displayName: username,
        });
        return anonymousUser;
      },
      {
        loadingMessage: "Signing in anonymously...",
        successMessage: "Signed in anonymously!",
        errorMessage: "Failed to sign in anonymously",
      },
    );
  };

  const signInWithGoogle = async () => {
    return authAsync.execute(
      async () => {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        return await signInWithPopup(auth, provider);
      },
      {
        loadingMessage: "Signing in with Google...",
        successMessage: "Signed in successfully!",
        errorMessage: "Failed to sign in with Google",
      },
    );
  };

  const registerWithEmail = async (email: string, password: string) => {
    return authAsync.execute(
      async () => {
        const auth = getAuth();
        return await createUserWithEmailAndPassword(auth, email, password);
      },
      {
        loadingMessage: "Creating your account...",
        successMessage: "Account created successfully!",
        errorMessage: "Failed to create account",
      },
    );
  };

  const loginWithEmail = async (email: string, password: string) => {
    return authAsync.execute(
      async () => {
        const auth = getAuth();
        return await signInWithEmailAndPassword(auth, email, password);
      },
      {
        loadingMessage: "Logging in...",
        successMessage: "Logged in successfully!",
        errorMessage: "Failed to log in",
      },
    );
  };

  return {
    signInAnonymous,
    signInWithGoogle,
    registerWithEmail,
    loginWithEmail,
    isLoading,
    authError: authAsync.error,
  };
}
