import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { io, Socket } from "socket.io-client";

let socket: Socket |  any = null;
export let playerss : Array<{ id: string, x: number, y: number }> = [];

const socketSlice = createSlice({
  name: "socket",
  initialState: {
    connected: false,
    players: Array<{ id: string; x: number; y: number; health: number }>(),
    socketid: "",
    socket: null
  },
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    setPlayers(state, action: PayloadAction<Array<{ id: string; x: number; y: number; health: number }>>) {
      state.players = action.payload;
    },
    setSocketId(state, action: PayloadAction<string>){
      state.socketid = action.payload;
    },
    connectSocket(state, action: PayloadAction<string>) {
      if (!socket) {
        socket = io(action.payload, { transports: ["websocket"] });
        socket.on('maze', (data: any) => {
          try {
            (window as any).__mazeData = data;
            try { window.dispatchEvent(new CustomEvent('mazeReady', { detail: data })); } catch (e) { }
            console.log('Maze stored on client from socketSlice listener');
          } catch (e) {
            console.warn('Failed to store maze data from socket listener', e);
          }
        });
        state.socket = socket
      }
    },
    disconnectSocket(state) {
      if (socket) {
        socket.disconnect();
        socket = null;
        state.connected = false;
        console.log("Desconectado del servidor");
      }
    },
    playerMove(state, action: PayloadAction<{ id: string, x: number, y: number }>) {
      const { id, x, y } = action.payload;
      const player = state.players.find(player => player.id === id);
      if (player) {
        player.x = x;
        player.y = y;
      }
      socket?.emit('player-move', { id: state.socketid, x: player?.x, y: player?.y });
    },
    updatePlayerHealth(state, action: PayloadAction<{ playerId: string, health: number }>) {
      const { playerId, health } = action.payload;
      const player = state.players.find(player => player.id === playerId);
      if (player) {
        player.health = health;
      }
    },
  }
});

export const { setConnected, connectSocket, disconnectSocket, setPlayers, playerMove, setSocketId, updatePlayerHealth } = socketSlice.actions;
export default socketSlice.reducer;