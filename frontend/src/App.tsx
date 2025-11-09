import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket, setConnected, setSocketId, setPlayers, updatePlayerHealth } from "./redux/socketSlice";
import { AuthContainer } from "./auth/presentation/auth-container";
import { LogoutButton } from "./components/LogoutButton";
import Phaser from "phaser"
import { updatePlayers } from "./utils/UpdatePlayers";
import { initializeGame } from "./utils/InicializeGame";
import './App.css'

const App = () => {
  const dispatch = useDispatch();
  const { connected, socket, players } = useSelector((state: any) => state.socket);
  const { isAuthenticated } = useSelector((state: any) => state.auth);
  const connect = () => {
    const socket = dispatch(connectSocket(import.meta.env.VITE_APP_SERVER));
    dispatch(setConnected(true));
    // Store socket reference globally for fireball events
    (window as any).socket = socket;
  };
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

      socket.on("current-players", (players: Array<{ id: string, x: number, y: number, health: number }>) => {
        dispatch(setPlayers(players));
        if (gameRef.current) {
          const scene = gameRef.current.scene.getAt(0) as Phaser.Scene;
          if (scene) {
            updatePlayers(scene, players);
          }
        }
      });

      socket.on("player-hit", (data: { playerId: string, health: number }) => {
        dispatch(updatePlayerHealth(data));
        // Update the game scene immediately
        if (gameRef.current) {
          const scene = gameRef.current.scene.getAt(0) as Phaser.Scene;
          if (scene) {
            updatePlayers(scene, players.map((p: { id: string; x: number; y: number; health: number }) => p.id === data.playerId ? { ...p, health: data.health } : p));
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
          <div className="game-container">
            <div className="game-header">
              <LogoutButton className="game-logout-button" />
            </div>
            <div id="phaser-game"></div>
            <div className="health-display">
              {players.map((player: { id: string; x: number; y: number; health: number }) => (
                <div key={player.id} className="player-health">
                  Player {player.id.slice(0, 4)}: {player.health} HP
                </div>
              ))}
            </div>
            <button onClick={connect}>Empezar</button>
          </div>
        </>
      )}
    </>
  );
};

export default App;