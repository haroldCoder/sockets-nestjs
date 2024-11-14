import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@Injectable()
export class ChannelService {
  channels: Set<string> = new Set();

  createChannel(channelName: string, client: Socket, server: Server): void {
    if (!this.channels.has(channelName)) {
      this.channels.add(channelName);
      client.join(channelName);
    } else {
      client.emit('message', `The channel ${channelName} exist`);
    }
  }

  sendMessageToChannel(channelName: string, message: string, server: Server): void {
      server.emit(channelName, message);
  }
}
