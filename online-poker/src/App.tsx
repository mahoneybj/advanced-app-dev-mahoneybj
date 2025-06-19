import "./App.css";
import Login from "./components/pages/Login";
import { useEffect } from "react";
import toast from "react-hot-toast";
import LandingPage from "./components/pages/LandingPage";
import Lobby from "./components/pages/Lobby";
import { Routes, Route } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import { GameProvider } from "./context/GameContext";
import Game from "./components/pages/Game";
import Winner from "./components/pages/Winner";
import GameContextWrapper from "./components/GameContextWrapper";

const App = () => {
  useEffect(() => {
    const handleOnline = () => {
      toast("You're back online! Changes will now sync.", {
        icon: "🔗",
      });
    };

    const handleOffline = () => {
      toast(
        "You're offline. Changes will be saved locally and sync when you're back online.",
        {
          icon: "⛓️‍💥",
        },
      );
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <div className="app-container">
      <div className="page-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <GameProvider>
                <ProtectedRoute>
                  <LandingPage />
                </ProtectedRoute>
              </GameProvider>
            }
          />
          <Route
            path="/lobby/:gameId"
            element={
              <GameProvider>
                <GameContextWrapper>
                  <ProtectedRoute>
                    <Lobby />
                  </ProtectedRoute>
                </GameContextWrapper>
              </GameProvider>
            }
          />
          <Route
            path="/game/:gameId"
            element={
              <GameProvider>
                <GameContextWrapper>
                  <ProtectedRoute>
                    <Game />
                  </ProtectedRoute>
                </GameContextWrapper>
              </GameProvider>
            }
          />
          <Route
            path="/winner/:gameId"
            element={
              <GameProvider>
                <GameContextWrapper>
                  <ProtectedRoute>
                    <Winner />
                  </ProtectedRoute>
                </GameContextWrapper>
              </GameProvider>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
