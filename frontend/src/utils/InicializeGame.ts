import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { playerMove } from '../redux/socketSlice';
import Phaser from 'phaser';

export const initializeGame = (
  players: Array<{ id: string; x: number; y: number }>,
  gameRef: React.MutableRefObject<Phaser.Game | null>,
  dispatch: Dispatch<UnknownAction>,
  id: React.MutableRefObject<string>,
) => {
  if (gameRef.current) {
    gameRef.current.destroy(true);
    gameRef.current = null;
  }

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'phaser-game',
    scene: {
      preload: function (this: Phaser.Scene) {
        this.load.image(
          'dude',
          'https://labs.phaser.io/assets/sprites/phaser-dude.png',
        );
      },
      create: function (this: Phaser.Scene) {
        this.add.rectangle(400, 300, 800, 600, 0xaaaaaa);

        players.forEach((player) => {
          this.add.sprite(player.x, player.y, 'dude').setName(player.id);
        });
      },
      init: function (this: Phaser.Scene) {
        let player: Phaser.GameObjects.Sprite;
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
          player = this.children.getByName(
            id.current,
          ) as Phaser.GameObjects.Sprite;

          if (!player) return;

          switch (event.key) {
            case 'ArrowLeft':
              player.x -= 5;
              dispatch(playerMove({ id: id.current!, x: player.x, y: player.y }));
              break;
            case 'ArrowRight':
              player.x += 5;
              dispatch(playerMove({ id: id.current!, x: player.x, y: player.y }));
              break;
            case 'ArrowUp':
              player.y -= 5;
              dispatch(playerMove({ id: id.current!, x: player.x, y: player.y }));
              break;
            case 'ArrowDown':
              player.y += 5;
              dispatch(playerMove({ id: id.current!, x: player.x, y: player.y }));
              break;
          }
        });

        // this.input.keyboard?.on('keyup', () => {
        // //     dispatch(playerMove({ id: id.current!, x: player.x, y: player.y }));
        // });
      },
    },
  };

  gameRef.current = new Phaser.Game(config);
};
