import { MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelService } from './channel.service';
import { User } from '../users/domain/user.entity';
import { UserLoginService } from 'src/users/app/user-login.service';

@WebSocketGateway({transports: ['websocket'], cors: { origin: '*' }})
export class ServersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private users: Set<Socket> = new Set();
  private players: Map<string, { id: string; x: number; y: number }> = new Map();


  constructor(private readonly loggingService: UserLoginService, private readonly channelService: ChannelService){
  }

  handleConnection(@ConnectedSocket() client: Socket) {
      console.log(`user connected: ${client.handshake.address} ${client.handshake.url}`);
      this.users.add(client);
      const newPlayer = {
        id: client.id,
        x: 400,
        y: 300,
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
      this.players.set(client.id, {id: client.id, x: position.x, y: position.y})
      this.server.emit('current-players', Array.from(this.players.values()));
    }
  }
}
