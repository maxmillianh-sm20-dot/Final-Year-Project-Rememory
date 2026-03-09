import React from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { PersonaSetup } from './pages/PersonaSetup';
import { Dashboard } from './pages/Dashboard';
import { Chat } from './pages/Chat';
import { Voice } from './pages/Voice';
import { Closure } from './pages/Closure';
import { ResetPassword } from './pages/ResetPassword';
import { AppRoute } from './types';

const AppContent = () => {
  const { currentRoute } = useApp();

  const renderPage = () => {
    switch (currentRoute) {
      case AppRoute.LANDING:
        return <Landing />;
      case AppRoute.LOGIN:
        return <Login />;
      case AppRoute.SETUP:
        return <PersonaSetup />;
      case AppRoute.DASHBOARD:
        return <Dashboard />;
      case AppRoute.CHAT:
        return <Chat />;
      case AppRoute.VOICE:
        return <Voice />;
      case AppRoute.CLOSURE:
        return <Closure />;
      case AppRoute.RESET_PASSWORD:
        return <ResetPassword />;
      default:
        return <Landing />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
