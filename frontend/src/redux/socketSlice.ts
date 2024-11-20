import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { io, Socket } from "socket.io-client";

let socket: Socket |  any = null;
export let playerss : Array<{ id: string, x: number, y: number }> = [];

const socketSlice = createSlice({
  name: "socket",
  initialState: {
    connected: false,
    players: Array<{ id: string; x: number; y: number }>(),
    socketid: "",
    socket: null
  },
  reducers: {
    setConnected(state, action: PayloadAction<boolean>) {
      state.connected = action.payload;
    },
    setPlayers(state, action: PayloadAction<Array<{ id: string; x: number; y: number }>>) {
      state.players = action.payload;
    },
    setSocketId(state, action: PayloadAction<string>){
      state.socketid = action.payload;
    },
    connectSocket(state, action: PayloadAction<string>) {
      if (!socket) {
        socket = io(action.payload, { transports: ["websocket"] });
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
  }
});

export const { setConnected, connectSocket, disconnectSocket, setPlayers, playerMove, setSocketId } = socketSlice.actions;
export default socketSlice.reducer;