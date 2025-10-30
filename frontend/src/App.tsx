import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes';
import { SocketProvider } from './context/SocketContext';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
      <SocketProvider>
        <AppRoutes />
      </SocketProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;