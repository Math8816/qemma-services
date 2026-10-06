import { io } from 'socket.io-client';
import { getToken } from './api';

let socket = null;

export function connectSocket() {
  const token = getToken();
  if (!token) return null;

  socket = io('http://localhost:4000', {
    auth: { token },
  });

  socket.on('connect', () => console.log('🔌 Socket connected'));
  socket.on('disconnect', () => console.log('🔌 Socket disconnected'));
  socket.on('connect_error', (err) => console.error('Socket error:', err.message));

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}