import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connectSocket, disconnectSocket, playerMove, setConnected, setSocketId, setPlayers } from "./redux/socketSlice";
import Phaser from "phaser"

const App = () => {
  const dispatch = useDispatch();
  const { connected, socket, players } = useSelector((state: any) => state.socket);
  const connect = () => { dispatch(connectSocket(import.meta.env.VITE_APP_SERVER)); dispatch(setConnected(true)) };
  const id = useRef<string>("");
  const gameRef = useRef<Phaser.Game | null>(null);
  const [prevPlayersCount, setPrevPlayersCount] = useState(0);

  const initializeGame = (players: Array<{ id: string, x: number, y: number }>) => {
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: "phaser-game",
      scene: {
        preload: function (this: Phaser.Scene) {
          this.load.image("dude", "https://labs.phaser.io/assets/sprites/phaser-dude.png");
        },
        create: function (this: Phaser.Scene) {
          this.add.rectangle(400, 300, 800, 600, 0xaaaaaa);

          players.forEach((player) => {
            this.add.sprite(player.x, player.y, "dude").setName(player.id);
          });
        },
        init: function (this: Phaser.Scene) {
          const playerState = {
            moving: false
          }

          this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            const player = this.children.getByName(id.current) as Phaser.GameObjects.Sprite;
        
            if (!player) return;
            let moved = false;
        
            switch (event.key) {
              case 'ArrowLeft':
                player.x -= 5;
                moved = true;
                break;
              case 'ArrowRight':
                player.x += 5;
                moved = true;
                break;
              case 'ArrowUp':
                player.y -= 5;
                moved = true;
                break;
              case 'ArrowDown':
                player.y += 5;
                moved = true;
                break;
            }
        
            if (moved && !playerState.moving) {
              player.setPosition(player.x, player.y);
        
              if (connected) {
                dispatch(playerMove({ id: id.current!, x: player.x, y: player.y }));
              }
        
              playerState.moving = true;
            }
          });
        
          this.input.keyboard?.on('keyup', () => {
            playerState.moving = false;
          });
        },
      },
    };

    gameRef.current = new Phaser.Game(config);
  };

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
      });

      return () => {
        gameRef.current?.destroy(true);
        dispatch(disconnectSocket());
      };
    }
  }, [dispatch, connected]);

  useEffect(() => {
    if (players.length > prevPlayersCount) {
      initializeGame(players);
    }
    setPrevPlayersCount(players.length);
  }, [players]);

  return (
    <>
      <div id="phaser-game">

      </div>
      <button onClick={connect}>Empezar</button>
    </>
  );
};

export default App;