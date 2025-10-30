import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, token } = useAuth();

  const connect = () => {
    if (!socket && user && token) {
      const newSocket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        auth: {
          token,
          userId: user.id,
          agency: user.agency
        },
        transports: ['websocket', 'polling']
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setIsConnected(false);
      });

      // Join agency room for agency-specific updates
      newSocket.emit('join-agency', user.agency);

      setSocket(newSocket);
    }
  };

  const disconnect = () => {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    if (user && token) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, token]);

  // Auto-reconnect logic
  useEffect(() => {
    if (socket) {
      const handleReconnect = () => {
        if (!isConnected && user && token) {
          console.log('Attempting to reconnect...');
          socket.connect();
        }
      };

      const reconnectInterval = setInterval(handleReconnect, 5000);

      return () => {
        clearInterval(reconnectInterval);
      };
    }
  }, [socket, isConnected, user, token]);

  const value: SocketContextType = {
    socket,
    isConnected,
    connect,
    disconnect
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocketContext must be used within a SocketProvider');
  }
  return context;
};

export default SocketContext;