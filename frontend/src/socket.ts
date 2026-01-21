import { io } from 'socket.io-client';

// Get backend URL from environment variable
const URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export const socket = io(URL, {
    autoConnect: false
});
