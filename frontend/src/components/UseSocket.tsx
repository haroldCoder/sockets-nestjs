import { useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_APP_SERVER;

const useSocket = () => {
  const [socket, setSocket] = useState<Socket>();
  const [message, setMessage] = useState(null);
  const [isConnected, setIsConnected] = useState(false);


  useEffect(() => {
    if (!socket) {
      setSocket(io(SERVER_URL, { transports: ['websocket'] }))
    }
    socket?.on("connect", () => {
      console.log("Conectado al servidor WebSocket");
      setIsConnected(true);
      socket.emit('current-players');
    })

    socket?.on("koder", (data) => {
      console.log("Mensaje recibido:", data);
      setMessage(data);
    });

    socket?.on('maze', (data) => {
      try {
        (window as any).__mazeData = data;
        console.log('Maze received from server', data);
        try { window.dispatchEvent(new CustomEvent('mazeReady', { detail: data })); } catch(e) {}
      } catch (e) {
        console.warn('Failed to store maze data', e);
      }
    });

    socket?.on("disconnect", () => {
      console.log("Desconectado del servidor WebSocket");
      setIsConnected(false);
    });

    setSocket(socket);

    return () => {
      if (socket?.connected) {
        socket.disconnect();
        console.log("Desconectando WebSocket...");
      }
    };
  }, []);

  return { socket, message, isConnected };
};

export default useSocket;