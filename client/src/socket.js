import { io } from 'socket.io-client';

const socketUrl = import.meta.env.VITE_SOCKET_URL || window.location.origin;
const socket = io(socketUrl, {
  path: '/socket.io',
  autoConnect: true,
});

export default socket;
