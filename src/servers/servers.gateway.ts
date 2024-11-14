import { Inject } from '@nestjs/common';
import { MessageBody, OnGatewayConnection, SubscribeMessage, WebSocketGateway, WebSocketServer, OnGatewayDisconnect, ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChannelService } from './channel.service';

@WebSocketGateway(1800, {transports: ['websocket']})
export class ServersGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private users: Set<Socket> = new Set();
  channelService: ChannelService

  constructor(){
    this.channelService = new ChannelService();
  }

  handleConnection(client: Socket) {
      console.log(`user connected: ${client.handshake.address} ${client.handshake.url}`);
      this.users.add(client);
  }

  handleDisconnect(client: Socket){
    console.log(`user disconnected: ${client.handshake.address} ${client.handshake.url}`);
    this.users.delete(client);
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
}
