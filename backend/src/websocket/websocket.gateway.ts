import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WebSocketService } from './websocket.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
  },
})
export abstract class SocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    protected readonly webSocketService: WebSocketService,
    protected readonly authService: AuthService,
    protected readonly userService: UserService,
  ) {}

  async handleConnection(client: Socket) {
    const token = Array.isArray(client.handshake.query.token)
      ? client.handshake.query.token[0]
      : client.handshake.query.token;

    const user = await this.authService.validateToken(token);
    console.log(token);

    if (!user) {
      client.disconnect();
      return;
    }
    if (this.webSocketService.getSocket(user.id))
      this.webSocketService.getSocket(user.id).disconnect();
    this.webSocketService.addSocket(user.id, client);
    this.webSocketService.setStatus(user.id, 'online');
    this.webSocketService.updateStatusForFriends(user.id, 'online');
    console.log(`${user.id} connected`);
  }

  handleDisconnect(client: Socket) {
    const userId = this.webSocketService.getClientId(client);
    if (userId) {
      this.webSocketService.setStatus(userId, 'offline');
      this.webSocketService.updateStatusForFriends(userId, 'offline');
    }
    console.log(`${userId} disconnected`);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, payload: { chatId: number }) {
    client.join(`chat-${payload.chatId}`);
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveChatRoom(client: Socket, payload: { chatId: number }) {
    client.leave(`chat-${payload.chatId}`);
  }
}
