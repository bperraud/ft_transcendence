import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { WebSocketService } from './websocket.service';
import { AuthService } from 'src/auth/auth.service';
import { UserService } from 'src/user/user.service';
import { StatService } from 'src/stat/stat.service';
import { NotificationService } from 'src/notification/notification.service';
import { PongService } from 'src/pong/pong.service';

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

  //BAN//

  //  @SubscribeMessage('banUser')
  //  async handleBanUser(
  //    client: Socket,
  //    payload: { chatId: number; userId: number; duration: number | null },
  //  ) {
  //    const { chatId, userId, duration } = payload;
  //    const expiresAt = await this.chatService.banUser(chatId, userId, duration);
  //    const socket = await this.webSocketService.getSocket(userId);
  //    if (socket) socket.emit('userBan', { chatId, expiresAt });

  //    return;
  //  }

  //  @SubscribeMessage('unBanUser')
  //  async handleUnbanUser(
  //    client: Socket,
  //    payload: { chatId: number; userId: number },
  //  ) {
  //    const { chatId, userId } = payload;
  //    const socket = this.webSocketService.getSocket(userId);

  //    await this.chatService.unBanUser(chatId, userId);
  //    if (socket) socket.emit('userUnBan', { chatId });
  //    return;
  //  }

  //  //MUTE//

  //  @SubscribeMessage('muteUser')
  //  async handleMuteUser(
  //    client: Socket,
  //    payload: { chatId: number; userId: number; duration: number | null },
  //  ) {
  //    const { chatId, userId, duration } = payload;
  //    const expiresAt = await this.chatService.muteUser(chatId, userId, duration);
  //    const socket = await this.webSocketService.getSocket(userId);
  //    if (socket) socket.emit('userMute', { chatId, expiresAt });

  //    return;
  //  }

  //  @SubscribeMessage('unMuteUser')
  //  async handleUnMuteUser(
  //    client: Socket,
  //    payload: { chatId: number; userId: number },
  //  ) {
  //    const { chatId, userId } = payload;
  //    const socket = this.webSocketService.getSocket(userId);

  //    await this.chatService.unMuteUser(chatId, userId);
  //    socket.emit('userUnMute', { chatId });
  //    return;
  //  }

  //  @SubscribeMessage('changeRole')
  //  async handleChangeRole(
  //    client: Socket,
  //    payload: { chatId: number; userId: number; newRoleId: number },
  //  ) {
  //    const { chatId, userId, newRoleId } = payload;
  //    await this.chatService.changeRole(chatId, userId, newRoleId);
  //    this.server.to(`chat-${chatId}`).emit('updateRole', {
  //      chatId: chatId,
  //      userId: userId,
  //      newRoleId: newRoleId,
  //    });
  //    return;
  //  }

  //  @SubscribeMessage('setAccess')
  //  async handleSetAccess(
  //    client: Socket,
  //    payload: { chatId: number; isProtected: boolean; password?: string },
  //  ) {
  //    const { chatId, isProtected, password } = payload;
  //    await this.chatService.setAccess(chatId, isProtected, password);
  //    return;
  //  }

  //  @SubscribeMessage('setPassword')
  //  async setPassword(
  //    client: any,
  //    payload: { chatId: number; password: string },
  //  ): Promise<void> {
  //    const { chatId, password } = payload;
  //    await this.chatService.setPassword(chatId, password);
  //  }
}
