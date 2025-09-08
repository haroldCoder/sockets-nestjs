import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket, setConnected, setSocketId, setPlayers } from "./redux/socketSlice";
import { AuthContainer } from "./auth/presentation/auth-container";
import Phaser from "phaser"
import { updatePlayers } from "./utils/UpdatePlayers";
import { initializeGame } from "./utils/InicializeGame";

const App = () => {
  const dispatch = useDispatch();
  const { connected, socket, players } = useSelector((state: any) => state.socket);
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const connect = () => { dispatch(connectSocket(import.meta.env.VITE_APP_SERVER)); dispatch(setConnected(true)) };
  const id = useRef<string>("");
  const gameRef = useRef<Phaser.Game | null>(null);
  const [prevPlayersCount, setPrevPlayersCount] = useState(0);

  useEffect(() => {
    if (connected) {
      socket.on("connect", () => {
        setConnected(true);
        id.current = socket.id;

        dispatch(setSocketId(socket.id))
        console.log("Conectado a Socket.IO");
      });

      socket.on("connect", () => {
        setConnected(true);
        console.log("Conectado a Socket.IO");
      });


      socket.on("disconnect", () => {
        setConnected(false);
        console.log("Desconectado de Socket.IO");
      });

      socket.on("current-players", (players: Array<{ id: string, x: number, y: number }>) => {
        dispatch(setPlayers(players));
        if (gameRef.current) {
          const scene = gameRef.current.scene.getAt(0) as Phaser.Scene;
          if (scene) {
            updatePlayers(scene, players);
          }
        }
      });

      return () => {
        gameRef.current?.destroy(true);
        dispatch(disconnectSocket());
      };
    }
  }, [dispatch, connected]);

  useEffect(() => {
    if (players.length > prevPlayersCount) {
      initializeGame(players, gameRef, dispatch, id);
    }
    setPrevPlayersCount(players.length);
  }, [players]);

  return (
    <>
      {!isAuthenticated ? (
        <AuthContainer />
      ) : (
        <>
          <div id="phaser-game"></div>
          <button onClick={connect}>Empezar</button>
        </>
      )}
    </>
  );
};

export default App;