import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from './context/FirebaseAuthContext';
import { LoadingProvider } from './context/IsLoadingContext';
import { Toaster } from 'react-hot-toast';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter>
    <LoadingProvider>
      <AuthProvider>
        <App />
        <Toaster position="top-center" reverseOrder={false}/>
      </AuthProvider>
    </LoadingProvider>
    </BrowserRouter>
  </React.StrictMode>
);


serviceWorkerRegistration.register();
reportWebVitals();
