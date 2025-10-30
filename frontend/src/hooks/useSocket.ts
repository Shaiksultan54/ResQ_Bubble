import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

export const useSocket = () => {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (isAuthenticated && token) {
      // Initialize socket connection
      socketRef.current = io('http://localhost:5000', {
        auth: {
          token
        }
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to server');
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from server');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [isAuthenticated, token]);

  return socketRef.current;
};