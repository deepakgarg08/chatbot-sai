import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
console.log('✌️backendUrl --->', backendUrl);

const socket = io(backendUrl);
console.log('✌️socket --->', socket);

export default socket;
