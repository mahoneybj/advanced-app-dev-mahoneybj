import './App.css';
import Login from './components/pages/Login';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import LandingPage from './components/pages/LandingPage';
import Lobby from './components/pages/Lobby';
import { Routes, Route } from 'react-router';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {

  useEffect(() => {
    const handleOnline = () => {
      toast("You're back online! Changes will now sync.", {
        icon: '🔗',
      });
    };

    const handleOffline = () => {
      toast("You're offline. Changes will be saved locally and sync when you're back online.", {
        icon: '⛓️‍💥',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
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
              <ProtectedRoute>
                <LandingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lobby/:gameId"
            element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;
