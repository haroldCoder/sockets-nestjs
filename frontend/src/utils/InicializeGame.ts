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
          'monster',
          'https://labs.phaser.io/assets/sprites/phaser-dude.png',
        );
        this.load.image(
          'fireball',
          'https://labs.phaser.io/assets/particles/red.png',
        );
      },
      create: function (this: Phaser.Scene) {
        this.add.rectangle(400, 300, 800, 600, 0xaaaaaa);

        const serverMaze = (window as any).__mazeData;
        const cellSize = serverMaze?.cellSize ?? 64;
        const cols = serverMaze?.cols ?? Math.floor(this.scale.width / cellSize);
        const rows = serverMaze?.rows ?? Math.floor(this.scale.height / cellSize);
        const walls: Phaser.Geom.Rectangle[] = [];

        if (serverMaze && serverMaze.walls && serverMaze.walls.length) {
          serverMaze.walls.forEach((w: { x: number; y: number; w: number; h: number }) => {
            const cx = w.x + w.w / 2;
            const cy = w.y + w.h / 2;
            const wallObj = this.add.rectangle(cx, cy, w.w, w.h, 0x333333);
            wallObj.setStrokeStyle(1, 0x000000);
            walls.push(new Phaser.Geom.Rectangle(w.x, w.y, w.w, w.h));
          });
          this.data.set('walls', walls);
        } else {
          const cellSize = 64;
          const cols = Math.floor(this.scale.width / cellSize);
          const rows = Math.floor(this.scale.height / cellSize);
          const wallThickness = 6;

          type Cell = { x: number; y: number; walls: { top: boolean; right: boolean; bottom: boolean; left: boolean }; visited: boolean };

          const grid: Cell[][] = [];
          for (let y = 0; y < rows; y++) {
            const row: Cell[] = [];
            for (let x = 0; x < cols; x++) {
              row.push({ x, y, walls: { top: true, right: true, bottom: true, left: true }, visited: false });
            }
            grid.push(row);
          }

          const neighbors = (c: Cell) => {
            const n: { cell: Cell; dir: string }[] = [];
            const { x, y } = c;
            if (y > 0 && !grid[y - 1][x].visited) n.push({ cell: grid[y - 1][x], dir: 'top' });
            if (x < cols - 1 && !grid[y][x + 1].visited) n.push({ cell: grid[y][x + 1], dir: 'right' });
            if (y < rows - 1 && !grid[y + 1][x].visited) n.push({ cell: grid[y + 1][x], dir: 'bottom' });
            if (x > 0 && !grid[y][x - 1].visited) n.push({ cell: grid[y][x - 1], dir: 'left' });
            return n;
          };

          const stack: Cell[] = [];
          const start = grid[0][0];
          start.visited = true;
          stack.push(start);

          while (stack.length) {
            const current = stack[stack.length - 1];
            const n = neighbors(current);
            if (n.length) {
              const nxt = n[Math.floor(Math.random() * n.length)];
              const nx = nxt.cell.x;
              const ny = nxt.cell.y;

              if (nxt.dir === 'top') {
                current.walls.top = false;
                grid[ny][nx].walls.bottom = false;
              } else if (nxt.dir === 'right') {
                current.walls.right = false;
                grid[ny][nx].walls.left = false;
              } else if (nxt.dir === 'bottom') {
                current.walls.bottom = false;
                grid[ny][nx].walls.top = false;
              } else if (nxt.dir === 'left') {
                current.walls.left = false;
                grid[ny][nx].walls.right = false;
              }
              grid[ny][nx].visited = true;
              stack.push(grid[ny][nx]);
            } else {
              stack.pop();
            }
          }

          for (let i = 0; i < Math.floor((cols * rows) / 3); i++) {
            const rx = Math.floor(Math.random() * cols);
            const ry = Math.floor(Math.random() * rows);
            const c = grid[ry][rx];
            const dirs = ['top', 'right', 'bottom', 'left'];
            const dir = dirs[Math.floor(Math.random() * dirs.length)];
            if (dir === 'top' && ry > 0) {
              c.walls.top = false;
              grid[ry - 1][rx].walls.bottom = false;
            }
            if (dir === 'right' && rx < cols - 1) {
              c.walls.right = false;
              grid[ry][rx + 1].walls.left = false;
            }
            if (dir === 'bottom' && ry < rows - 1) {
              c.walls.bottom = false;
              grid[ry + 1][rx].walls.top = false;
            }
            if (dir === 'left' && rx > 0) {
              c.walls.left = false;
              grid[ry][rx - 1].walls.right = false;
            }
          }

          const roomAttempts = Math.max(3, Math.floor((cols * rows) / 40));
          for (let r = 0; r < roomAttempts; r++) {
            const rw = 1 + Math.floor(Math.random() * Math.min(3, cols - 1));
            const rh = 1 + Math.floor(Math.random() * Math.min(3, rows - 1));
            const rx = Math.floor(Math.random() * Math.max(1, cols - rw));
            const ry = Math.floor(Math.random() * Math.max(1, rows - rh));
            for (let yy = ry; yy < ry + rh; yy++) {
              for (let xx = rx; xx < rx + rw; xx++) {
                const cell = grid[yy][xx];

                if (yy > ry) {
                  cell.walls.top = false;
                  grid[yy - 1][xx].walls.bottom = false;
                }
                if (xx > rx) {
                  cell.walls.left = false;
                  grid[yy][xx - 1].walls.right = false;
                }
              }
            }
          }

          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              const c = grid[y][x];
              const cellX = x * cellSize;
              const cellY = y * cellSize;
              const centerX = cellX + cellSize / 2;
              const centerY = cellY + cellSize / 2;

              if (c.walls.top) {
                const w = cellSize + wallThickness;
                const h = wallThickness;
                const cx = centerX;
                const cy = cellY + h / 2;
                const wallObj = this.add.rectangle(cx, cy, w, h, 0x333333);
                wallObj.setStrokeStyle(1, 0x000000);
                walls.push(new Phaser.Geom.Rectangle(cx - w / 2, cy - h / 2, w, h));
              }

              if (c.walls.right) {
                const w = wallThickness;
                const h = cellSize + wallThickness;
                const cx = cellX + cellSize - w / 2;
                const cy = centerY;
                const wallObj = this.add.rectangle(cx, cy, w, h, 0x333333);
                wallObj.setStrokeStyle(1, 0x000000);
                walls.push(new Phaser.Geom.Rectangle(cx - w / 2, cy - h / 2, w, h));
              }

              if (c.walls.bottom) {
                const w = cellSize + wallThickness;
                const h = wallThickness;
                const cx = centerX;
                const cy = cellY + cellSize - h / 2;
                const wallObj = this.add.rectangle(cx, cy, w, h, 0x333333);
                wallObj.setStrokeStyle(1, 0x000000);
                walls.push(new Phaser.Geom.Rectangle(cx - w / 2, cy - h / 2, w, h));
              }

              if (c.walls.left) {
                const w = wallThickness;
                const h = cellSize + wallThickness;
                const cx = cellX + w / 2;
                const cy = centerY;
                const wallObj = this.add.rectangle(cx, cy, w, h, 0x333333);
                wallObj.setStrokeStyle(1, 0x000000);
                walls.push(new Phaser.Geom.Rectangle(cx - w / 2, cy - h / 2, w, h));
              }
            }
          }

          this.data.set('walls', walls);
        }

        const projectiles = this.add.group();
        this.data.set('projectiles', projectiles);

        const isPositionFree = (cx: number, cy: number, padding = 4) => {
          const pw = 32;
          const ph = 32;
          const rect = new Phaser.Geom.Rectangle(cx - pw / 2 - padding, cy - ph / 2 - padding, pw + padding * 2, ph + padding * 2);
          return !walls.some(w => Phaser.Geom.Intersects.RectangleToRectangle(rect, w));
        };

        const findSpawnForPlayer = (attempts = 300) => {
          for (let i = 0; i < attempts; i++) {
            const rx = Math.floor(Math.random() * cols);
            const ry = Math.floor(Math.random() * rows);
            const cx = rx * cellSize + cellSize / 2;
            const cy = ry * cellSize + cellSize / 2;
            if (isPositionFree(cx, cy, 6)) return { x: cx, y: cy };
          }
          return { x: this.scale.width / 2, y: this.scale.height / 2 };
        };

        players.forEach((player) => {
          let px = player.x;
          let py = player.y;

          if (player.id === id.current) {
            if (!isPositionFree(px, py)) {
              const spawn = findSpawnForPlayer();
              px = spawn.x;
              py = spawn.y;
              dispatch(playerMove({ id: id.current!, x: px, y: py }));
            }
          } else {
            if (!isPositionFree(px, py)) {
              const spawn = findSpawnForPlayer(100);
              px = spawn.x;
              py = spawn.y;
            }
          }

          this.add.sprite(px, py, 'dude').setName(player.id);

          const healthBarBg = this.add.rectangle(px, py - 25, 40, 6, 0x000000).setName(`health-bg-${player.id}`);
          healthBarBg.setStrokeStyle(2, 0xffffff);

          const healthBarFill = this.add.rectangle(px - 18, py - 25, (player.health / 100) * 36, 4, 0x00ff00).setName(`health-fill-${player.id}`);
          healthBarFill.setOrigin(0, 0.5);
        });

        // Create monster sprite
        const monsterSpawn = findSpawnForPlayer();
        const monsterSprite = this.add.sprite(monsterSpawn.x, monsterSpawn.y, 'monster').setName('monster');
        monsterSprite.setTint(0xff0000); // Red tint to differentiate from players
        monsterSprite.setScale(1.2); // Slightly larger than players
        console.log('Monster sprite created at:', monsterSpawn.x, monsterSpawn.y);

        // Create monster health bars
        const monsterHealthBarBg = this.add.rectangle(monsterSpawn.x, monsterSpawn.y - 30, 50, 6, 0x000000).setName('monster-health-bg');
        monsterHealthBarBg.setStrokeStyle(2, 0xffffff);

        const monsterHealthBarFill = this.add.rectangle(monsterSpawn.x - 23, monsterSpawn.y - 30, 46, 4, 0xff0000).setName('monster-health-fill');
        monsterHealthBarFill.setOrigin(0, 0.5);

        // Store references in scene data for easy access from other parts of the app
        this.data.set('monsterSprite', monsterSprite);
        this.data.set('monsterHealthBg', monsterHealthBarBg);
        this.data.set('monsterHealthFill', monsterHealthBarFill);
      },
      init: function (this: Phaser.Scene) {
        let player: Phaser.GameObjects.Sprite;
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
          player = this.children.getByName(
            id.current,
          ) as Phaser.GameObjects.Sprite;

          if (!player) return;

          const walls = this.data.get('walls') as Phaser.Geom.Rectangle[] | undefined;

          const willCollide = (newX: number, newY: number) => {
            if (!walls) return false;
            const pw = (player.displayWidth || (player.width || 32));
            const ph = (player.displayHeight || (player.height || 32));
            const rect = new Phaser.Geom.Rectangle(newX - pw / 2, newY - ph / 2, pw, ph);
            
            // Check wall collisions
            if (walls.some(w => Phaser.Geom.Intersects.RectangleToRectangle(rect, w))) return true;

            // Check monster collision
            const monster = this.data.get('monsterSprite') as Phaser.GameObjects.Sprite | undefined;
            if (monster) {
                const mw = monster.displayWidth || monster.width || 32;
                const mh = monster.displayHeight || monster.height || 32;
                // Use a slightly smaller hitbox for the monster to allow getting close but not overlapping
                const mRect = new Phaser.Geom.Rectangle(monster.x - mw / 2 + 5, monster.y - mh / 2 + 5, mw - 10, mh - 10);
                if (Phaser.Geom.Intersects.RectangleToRectangle(rect, mRect)) return true;
            }

            return false;
          };

          switch (event.key) {
            case 'ArrowLeft': {
              const newX = player.x - 5;
              if (!willCollide(newX, player.y)) {
                player.x = newX;
                dispatch(playerMove({ id: id.current!, x: player.x, y: player.y }));
              }
              break;
            }
            case 'ArrowRight': {
              const newX = player.x + 5;
              if (!willCollide(newX, player.y)) {
                player.x = newX;
                dispatch(playerMove({ id: id.current!, x: player.x, y: player.y }));
              }
              break;
            }
            case 'ArrowUp': {
              const newY = player.y - 5;
              if (!willCollide(player.x, newY)) {
                player.y = newY;
                dispatch(playerMove({ id: id.current!, x: player.x, y: player.y }));
              }
              break;
            }
            case 'ArrowDown': {
              const newY = player.y + 5;
              if (!willCollide(player.x, newY)) {
                player.y = newY;
                dispatch(playerMove({ id: id.current!, x: player.x, y: player.y }));
              }
              break;
            }
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
