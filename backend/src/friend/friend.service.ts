import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketService } from '../websocket/websocket.service';
import { UserService } from '../user/user.service';
import { User } from '@prisma/client';
import { Notif } from '@prisma/client';

@Injectable()
export class FriendService {
  constructor(
    private prisma: PrismaService,
    private socketService: WebSocketService,
    private userService: UserService,
  ) {}

  async getFriends(userId: number) {
    try {
      const friends = await this.prisma.$queryRaw<
        User[]
      >`SELECT id, username FROM "public"."User" WHERE id IN (
		SELECT "user1Id" FROM "public"."Relationship" WHERE "user2Id" = ${userId} UNION SELECT "user2Id" FROM "public"."Relationship" WHERE "user1Id" = ${userId}
	  )`;
      return friends;
    } catch (error) {
      throw error;
    }
  }

  async isFriendOf(id: number, friendId: number): Promise<boolean> {
    const friendship = await this.prisma.relationship.findMany({
      where: {
        AND: [
          {
            OR: [
              { user1Id: id, user2Id: friendId },
              { user1Id: friendId, user2Id: id },
            ],
          },
          {
            type: Notif['FRIEND'],
          },
        ],
      },
    });
    return friendship.length > 0;
  }

  async addFriend(userId: number, friendId: number) {
    if (await this.isFriendOf(userId, friendId)) {
      throw new ForbiddenException('User already in friends list');
    }
    try {
      await this.notifyFriend(friendId);
      await this.prisma.relationship.create({
        data: {
          user1: {
            connect: { id: userId },
          },
          user2: {
            connect: { id: friendId },
          },
          type: Notif['FRIEND'],
        },
      });
    } catch (error) {
      throw new ForbiddenException('Fail to update in database');
    }
  }

  async notifyFriend(friendId: number) {
    if ((await this.userService.getUserStatus(friendId)) != 'offline') {
      this.socketService.sendToUser(friendId, '', 'friend');
    }
  }

  async removeFriend(userId: number, friendId: number) {
    if (!(await this.isFriendOf(userId, friendId))) {
      throw new NotFoundException('User not in friends list');
    }
    try {
      await this.prisma.relationship.deleteMany({
        where: {
          AND: [
            {
              OR: [
                { user1Id: userId, user2Id: friendId },
                { user1Id: friendId, user2Id: userId },
              ],
            },
            {
              type: Notif['FRIEND'],
            },
          ],
        },
      });
      this.notifyFriend(friendId);
    } catch (error) {
      throw new ForbiddenException('Fail to update in database');
    }
  }
}
