import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
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
export class ChatsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private onlineUsers = new Map<number, string>();

  handleConnection(client: Socket) {
    console.log('Client connected:', client.id);
  }

  handleDisconnect(client: Socket) {
    for (const [userId, socketId] of this.onlineUsers.entries()) {
      if (socketId === client.id) {
        this.onlineUsers.delete(userId);
      }
    }

    this.emitOnlineUsers();
  }

  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: number,
  ) {
    this.onlineUsers.set(userId, client.id);

    this.emitOnlineUsers();
  }

  @SubscribeMessage('joinChat')
  handleJoinChat(
    @ConnectedSocket() client: Socket,
    @MessageBody() conversationId: number,
  ) {
    client.join(`chat_${conversationId}`);
  }

  sendMessageToChat(conversationId: number, message: any) {
    this.server.to(`chat_${conversationId}`).emit('newMessage', message);
  }

  emitOnlineUsers() {
    this.server.emit(
      'onlineUsers',
      Array.from(this.onlineUsers.keys()),
    );
  }
  sendNewConversationToUsers(userIds: number[], conversation: any) {
    for (const userId of userIds) {
      const socketId = this.onlineUsers.get(userId);

      if (socketId) {
        this.server.to(socketId).emit('newConversation', conversation);
      }
    }
  }
}