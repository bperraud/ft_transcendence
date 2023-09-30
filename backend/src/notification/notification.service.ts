import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketService } from 'src/websocket/websocket.service';
import { UserService } from 'src/user/user.service';
import { Notif } from '@prisma/client';

@Injectable()
export class NotificationService {
  constructor(
    private socketService: WebSocketService,
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async notifyEvent(friendId: number, userId: number, message: string) {
    try {
      const firstNotif = await this.prisma.notification.findFirst({
        where: {
          senderId: userId,
          type: Notif[message],
          userId: friendId,
        },
      });
      if (firstNotif) {
        await this.prisma.notification.delete({
          where: { id: firstNotif.id },
        });
      }
      const notif = await this.prisma.notification.create({
        data: {
          user: {
            connect: {
              id: friendId,
            },
          },
          sender: {
            connect: {
              id: userId,
            },
          },
          type: Notif[message],
        },
      });
      if ((await this.userService.getUserStatus(friendId)) != 'offline') {
        this.socketService.sendToUser(friendId, '', message);
      }
      return notif;
    } catch (error) {
      throw new NotFoundException('Error in NotificationService');
    }
  }

  async removeNotification(userId: number, friendId: number, message: string) {
    try {
      const userToNotify = await this.prisma.notification.findMany({
        where: {
          senderId: friendId,
          type: Notif[message],
        },
      });
      await this.prisma.notification.deleteMany({
        where: {
          userId: userId,
          senderId: friendId,
          type: Notif[message],
        },
      });
      return userToNotify.map((item) => item.userId);
    } catch (error) {}
  }
}
