import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WebSocketService } from '../websocket/websocket.service';
import { UserService } from '../user/user.service';

@Injectable()
export class FriendService {
  constructor(
    private prisma: PrismaService,
    private socketService: WebSocketService,
    private userService: UserService,
  ) {}

  //  async getFriends(userId: number): Promise<number[]> {
  async getFriends(userId: number) {
    const friends = await this.prisma.relationship.findMany({
      where: {
        AND: [
          {
            OR: [{ user1Id: userId }, { user2Id: userId }],
          },
          {
            type: 'friend',
          },
        ],
      },
    });
    return friends;
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
            type: 'friend',
          },
        ],
      },
    });

    return friendship == null;
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
          type: 'friend',
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
              type: 'friend',
            },
          ],
        },
      });

      // notify friend
      await this.notifyFriend(friendId);

      //  delete user.hash;
      //  return user;
    } catch (error) {
      throw new ForbiddenException('Fail to update in database');
    }
  }
}
