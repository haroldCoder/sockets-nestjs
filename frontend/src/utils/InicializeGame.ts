import { Dispatch, UnknownAction } from '@reduxjs/toolkit';
import { playerMove } from '../redux/socketSlice';
import Phaser from 'phaser';

export const initializeGame = (
  players: Array<{ id: string; x: number; y: number; health: number }>,
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
        this.load.image(
          'fireball',
          'https://labs.phaser.io/assets/particles/red.png',
        );
      },
      create: function (this: Phaser.Scene) {
        this.add.rectangle(400, 300, 800, 600, 0xaaaaaa);

        const projectiles = this.add.group();
        this.data.set('projectiles', projectiles);

        players.forEach((player) => {
          this.add.sprite(player.x, player.y, 'dude').setName(player.id);

          // Create health bar background
          const healthBarBg = this.add.rectangle(player.x, player.y - 25, 40, 6, 0x000000).setName(`health-bg-${player.id}`);
          healthBarBg.setStrokeStyle(2, 0xffffff);

          // Create health bar fill
          const healthBarFill = this.add.rectangle(player.x - 18, player.y - 25, (player.health / 100) * 36, 4, 0x00ff00).setName(`health-fill-${player.id}`);
          healthBarFill.setOrigin(0, 0.5);
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
            case 'a':
            case 'A': {
              const group = this.data.get('projectiles') as Phaser.GameObjects.Group | undefined;
              const fireball = this.add.sprite(player.x, player.y, 'fireball').setScale(0.5);
              group?.add(fireball);
              this.tweens.add({
                targets: fireball,
                x: -50,
                duration: 800,
                onComplete: () => fireball.destroy(),
              });
              // Emit fireball event to backend
              const socket = (window as any).socket;
              if (socket) {
                socket.emit('fireball', { x: player.x, y: player.y, direction: 'left' });
              }
              break;
            }
            case 'd':
            case 'D': {
              const group = this.data.get('projectiles') as Phaser.GameObjects.Group | undefined;
              const fireball = this.add.sprite(player.x, player.y, 'fireball').setScale(0.5);
              group?.add(fireball);
              this.tweens.add({
                targets: fireball,
                x: this.scale.width + 50,
                duration: 800,
                onComplete: () => fireball.destroy(),
              });
              // Emit fireball event to backend
              const socket = (window as any).socket;
              if (socket) {
                socket.emit('fireball', { x: player.x, y: player.y, direction: 'right' });
              }
              break;
            }
            case 'w':
            case 'W': {
              const group = this.data.get('projectiles') as Phaser.GameObjects.Group | undefined;
              const fireball = this.add.sprite(player.x, player.y, 'fireball').setScale(0.5);
              group?.add(fireball);
              this.tweens.add({
                targets: fireball,
                y: -50,
                duration: 800,
                onComplete: () => fireball.destroy(),
              });
              // Emit fireball event to backend
              const socket = (window as any).socket;
              if (socket) {
                socket.emit('fireball', { x: player.x, y: player.y, direction: 'up' });
              }
              break;
            }
            case 's':
            case 'S': {
              const group = this.data.get('projectiles') as Phaser.GameObjects.Group | undefined;
              const fireball = this.add.sprite(player.x, player.y, 'fireball').setScale(0.5);
              group?.add(fireball);
              this.tweens.add({
                targets: fireball,
                y: this.scale.height + 50,
                duration: 800,
                onComplete: () => fireball.destroy(),
              });
              // Emit fireball event to backend
              const socket = (window as any).socket;
              if (socket) {
                socket.emit('fireball', { x: player.x, y: player.y, direction: 'down' });
              }
              break;
            }
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
