import { MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelService } from './channel.service';
import { User } from '../users/domain/user.entity';
import { UserLoginService } from 'src/users/app/user-login.service';

@WebSocketGateway({transports: ['websocket'], cors: { origin: '*' }})
export class ServersGateway implements OnGatewayConnection, OnGatewayDisconnect {
@WebSocketServer() server: Server;
private users: Set<Socket> = new Set();
private players: Map<string, { id: string; x: number; y: number; health: number }> = new Map();
private projectiles: Map<string, { id: string; x: number; y: number; direction: string; owner: string }> = new Map();
 private maze: { cellSize: number; cols: number; rows: number; walls: Array<{ x: number; y: number; w: number; h: number }> } | null = null;
 private mazeGenerating = false;


constructor(private readonly loggingService: UserLoginService, private readonly channelService: ChannelService){
}

  handleConnection(@ConnectedSocket() client: Socket) {
      console.log(`user connected: ${client.handshake.address} ${client.handshake.url}`);
      this.users.add(client);
      const newPlayer = {
        id: client.id,
        x: 400,
        y: 300,
        health: 100,
      };
  
      this.players.set(client.id, newPlayer);

      if (!this.maze && !this.mazeGenerating) {
        this.mazeGenerating = true;
        this.maze = this.generateMaze(800, 600);
        this.mazeGenerating = false;
        this.server.emit('maze', this.maze);
      } else if (this.maze) {
        client.emit('maze', this.maze);
      } else if (this.mazeGenerating) {
        setTimeout(() => {
          if (this.maze) client.emit('maze', this.maze);
        }, 50);
      }

      client.emit('current-players', Array.from(this.players.values()));
  }

  handleDisconnect(client: Socket){
    console.log(`user disconnected: ${client.handshake.address} ${client.handshake.url}`);
    this.users.delete(client);
    this.players.delete(client.id);

    this.server.emit('current-players', Array.from(this.players.values()));

    if (this.players.size === 0) {
      this.maze = null;
    }
  }

  private generateMaze(width: number, height: number) {
    const cellSize = 64;
    const cols = Math.floor(width / cellSize);
    const rows = Math.floor(height / cellSize);
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

    const walls: Array<{ x: number; y: number; w: number; h: number }> = [];
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
          walls.push({ x: cx - w / 2, y: cy - h / 2, w, h });
        }
        if (c.walls.right) {
          const w = wallThickness;
          const h = cellSize + wallThickness;
          const cx = cellX + cellSize - w / 2;
          const cy = centerY;
          walls.push({ x: cx - w / 2, y: cy - h / 2, w, h });
        }
        if (c.walls.bottom) {
          const w = cellSize + wallThickness;
          const h = wallThickness;
          const cx = centerX;
          const cy = cellY + cellSize - h / 2;
          walls.push({ x: cx - w / 2, y: cy - h / 2, w, h });
        }
        if (c.walls.left) {
          const w = wallThickness;
          const h = cellSize + wallThickness;
          const cx = cellX + w / 2;
          const cy = centerY;
          walls.push({ x: cx - w / 2, y: cy - h / 2, w, h });
        }
      }
    }

    return { cellSize, cols, rows, walls };
  }

  getUsersConnecteds(): Array<string>{
    return Array.from(this.users).map(client => client.id);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@MessageBody() roomName: string, @ConnectedSocket() client: Socket){
    this.channelService.createChannel(roomName, client, this.server);
    console.log(this.channelService.channels);
  }

  @SubscribeMessage('main')
  handleMessage(@MessageBody() data: {channel: string, data: string}, @ConnectedSocket() client: Socket): string {
    this.channelService.sendMessageToChannel(data.channel, data.data, this.server);
    return data.data
  }

  @SubscribeMessage('login')
  async handleLogin(@MessageBody() {password, username}: User, @ConnectedSocket() client: Socket){
    const result = await this.loggingService.execute({username, password})
    if(result){
      client.emit("login", "user logged")
      return "user logged"
    }
    else{
      client.emit("login", "an ocurred error")
      return "an ocurred error"
    }
  }

  @SubscribeMessage('player-move')
  handlePlayerMove(
    @MessageBody() position: { x: number; y: number },
    @ConnectedSocket() client: Socket,
  ) {
    const player = this.players.get(client.id);

    if (player) {
      this.players.set(client.id, {id: client.id, x: position.x, y: position.y, health: player.health})
      this.server.emit('current-players', Array.from(this.players.values()));
    }
  }

  @SubscribeMessage('fireball')
  handleFireball(
    @MessageBody() data: { x: number; y: number; direction: string },
    @ConnectedSocket() client: Socket,
  ) {
    const projectileId = `${client.id}_${Date.now()}`;
    const projectile = {
      id: projectileId,
      x: data.x,
      y: data.y,
      direction: data.direction,
      owner: client.id,
    };

    this.projectiles.set(projectileId, projectile);

    // Simulate projectile movement and collision detection
    this.simulateProjectile(projectileId);
  }

  private simulateProjectile(projectileId: string) {
    const projectile = this.projectiles.get(projectileId);
    if (!projectile) return;

    let newX = projectile.x;
    let newY = projectile.y;

    switch (projectile.direction) {
      case 'left':
        newX -= 10;
        break;
      case 'right':
        newX += 10;
        break;
      case 'up':
        newY -= 10;
        break;
      case 'down':
        newY += 10;
        break;
    }

    // Check for collisions with players
    for (const [playerId, player] of this.players) {
      if (playerId !== projectile.owner) {
        // Check if projectile is within player bounds (player sprite is roughly 32x32)
        const playerLeft = player.x - 16;
        const playerRight = player.x + 16;
        const playerTop = player.y - 16;
        const playerBottom = player.y + 16;

        if (newX >= playerLeft && newX <= playerRight && newY >= playerTop && newY <= playerBottom) {
          console.log(`Projectile ${projectileId} hit player ${playerId}`);

          // Reduce player health
          player.health -= 20;
          if (player.health <= 0) {
            player.health = 0;
          }

          // Remove projectile
          this.projectiles.delete(projectileId);

          // Emit health update
          this.server.emit('player-hit', { playerId, health: player.health });

          // Emit updated players list
          this.server.emit('current-players', Array.from(this.players.values()));
          return;
        }
      }
    }

    // Update projectile position
    projectile.x = newX;
    projectile.y = newY;

    // Check if projectile is out of bounds
    if (newX < -50 || newX > 850 || newY < -50 || newY > 650) {
      this.projectiles.delete(projectileId);
      return;
    }

    // Continue simulation
    setTimeout(() => this.simulateProjectile(projectileId), 50);
  }
}
