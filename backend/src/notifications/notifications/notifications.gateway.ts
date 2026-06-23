import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: 'http://localhost:5173',
    credentials: true,
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  private onlineUsers = new Map<number, string>();

  @SubscribeMessage('registerNotifications')
  register(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: number,
  ) {
    this.onlineUsers.set(userId, client.id);
  }

  sendToUser(userId: number, notification: any) {
    const socketId = this.onlineUsers.get(userId);

    if (socketId) {
      this.server.to(socketId).emit('notification', notification);
    }
  }
}