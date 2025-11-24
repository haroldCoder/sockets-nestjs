import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket, setConnected, setSocketId, setPlayers, updatePlayerHealth, updateMonster } from "./redux/socketSlice";
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




      socket.on("disconnect", () => {
        setConnected(false);
        console.log("Desconectado de Socket.IO");
      });

socket?.on("current-players", (players: Array<{ id: string, x: number, y: number, health: number }>) => {
  dispatch(setPlayers(players));
  if (gameRef.current) {
    const scene = gameRef.current.scene.getAt(0) as Phaser.Scene;
    if (scene) {
      updatePlayers(scene, players);
    }
  }
});

socket?.on("monster-update", (monsterState: { x: number; y: number; targetId: string | null; health: number }) => {
  dispatch(updateMonster(monsterState));
  
  if (gameRef.current) {
    const scene = gameRef.current.scene.getAt(0) as Phaser.Scene;
    if (scene && scene.sys && scene.sys.isActive()) {
      const monsterSprite = scene.data.get('monsterSprite') as Phaser.GameObjects.Sprite | undefined;
      const healthBarBg = scene.data.get('monsterHealthBg') as Phaser.GameObjects.Rectangle | undefined;
      const healthBarFill = scene.data.get('monsterHealthFill') as Phaser.GameObjects.Rectangle | undefined;
      if (monsterSprite) {
        monsterSprite.setPosition(monsterState.x, monsterState.y);
        
        if (healthBarBg) {
          healthBarBg.setPosition(monsterState.x, monsterState.y - 30);
        }
        if (healthBarFill) {
          healthBarFill.setPosition(monsterState.x - 23, monsterState.y - 30);
          healthBarFill.width = (monsterState.health / 100) * 46;
        }
      } else {
        console.warn('Monster sprite not found in scene');
      }
    }
  }
});

socket.on("player-hit", (data: { playerId: string, health: number }) => {
        dispatch(updatePlayerHealth(data));
        if (gameRef.current) {
          const scene = gameRef.current.scene.getAt(0) as Phaser.Scene;
          if (scene) {
            updatePlayers(scene, players.map((p: { id: string; x: number; y: number; health: number }) => p.id === data.playerId ? { ...p, health: data.health } : p));
          }
        }
      });

      return () => {
        socket?.off("connect");
        socket?.off("disconnect");
        socket?.off("current-players");
        socket?.off("monster-update");
        socket?.off("player-hit");
      };
    }
  }, [dispatch, connected, socket]);

  useEffect(() => {
    if (players.length > prevPlayersCount) {
      const startGame = () => initializeGame(players, gameRef, dispatch, id);

      if ((window as any).__mazeData) {
        startGame();
      } else {
        const onMaze = () => {
          startGame();
          window.removeEventListener('mazeReady', onMaze);
        };
        window.addEventListener('mazeReady', onMaze);

        setTimeout(() => {
          if (!(window as any).__mazeData) {
            window.removeEventListener('mazeReady', onMaze);
            startGame();
          }
        }, 500);
      }
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