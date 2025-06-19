import { useState, useEffect } from "react";
import { useAuth } from "../../context/FirebaseAuthContext";
import { useFirebaseAuth } from "../../hooks/useFirebaseAuth";
import { useNavigate } from "react-router";
import { useLoading } from "../../context/IsLoadingContext";

const Login = () => {
  const { user } = useAuth();
  const {
    signInAnonymous,
    signInWithGoogle,
    loginWithEmail,
    registerWithEmail,
  } = useFirebaseAuth();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isLoading } = useLoading();

  const handleAnonymousLogin = async () => {
    await signInAnonymous(username);
    navigate("/");
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      navigate("/");
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleEmailLoginOrRegister = async () => {
    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      navigate("/");
    } catch (error: any) {
      console.error("Email login/register failed:", error);

      if (error.code === "auth/weak-password") {
        setError("Password must be at least 6 characters");
      } else if (error.code === "auth/email-already-in-use") {
        setError("This email is already registered");
      } else if (error.code === "auth/invalid-email") {
        setError("Please enter a valid email address");
      } else {
        // Fallback to the Firebase-formatted message
        setError(error.message || "An unknown error occurred");
      }
    }
  };

  useEffect(() => {
    if (user) {
      setError(null);
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="login-container">
      <h1>Login</h1>
      <input
        type="username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="login-input"
        disabled={isLoading}
      />
      <button
        onClick={handleAnonymousLogin}
        className="login-button"
        disabled={isLoading}
      >
        Login Anonymously
      </button>
      <button
        onClick={handleGoogleLogin}
        className="login-button"
        disabled={isLoading}
      >
        Login with Google
      </button>
      <div className="email-login">
        <h2>{isRegister ? "Register" : "Login"} with Email</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
          disabled={isLoading}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
          disabled={isLoading}
        />
        <button
          onClick={handleEmailLoginOrRegister}
          className="login-button"
          disabled={isLoading}
        >
          {isRegister ? "Register" : "Login"}
        </button>
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="toggle-button"
          disabled={isLoading}
        >
          Switch to {isRegister ? "Login" : "Register"}
        </button>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default Login;
