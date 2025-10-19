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

      client.emit('current-players', Array.from(this.players.values()));
  }

  handleDisconnect(client: Socket){
    console.log(`user disconnected: ${client.handshake.address} ${client.handshake.url}`);
    this.users.delete(client);
    this.players.delete(client.id);

    this.server.emit('current-players', Array.from(this.players.values()));
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
