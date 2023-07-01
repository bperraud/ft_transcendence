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

  async getFriends(userId: number): Promise<number[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return user.friends;
  }

  async findFriend(id: number, friendId: number): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: id },
    });
    return user.friends.includes(friendId);
  }

  async addFriend(userId: number, friendId: number) {
    if (await this.findFriend(userId, friendId)) {
      throw new ForbiddenException('User already in friends list');
    }
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: { friends: { push: friendId } },
      });
      const friend = await this.prisma.user.update({
        where: { id: friendId },
        data: { friends: { push: user.id } },
      });
      if ((await this.userService.getUserStatus(friend.id)) != 'offline') {
        this.socketService.sendToUser(friendId, user.username, 'friend');
      }
      delete user.hash;
      return user;
    } catch (error) {
      throw new ForbiddenException('Fail to update in database');
    }
  }

  async removeFriend(userId: number, friendId: number) {
    if (!(await this.findFriend(userId, friendId))) {
      throw new NotFoundException('User not in friends list');
    }
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          friends: {
            set: (
              await this.prisma.user.findUnique({
                where: { id: userId },
                select: { friends: true },
              })
            ).friends.filter((id) => id !== friendId),
          },
        },
      });
      const friend = await this.prisma.user.update({
        where: { id: friendId },
        data: {
          friends: {
            set: (
              await this.prisma.user.findUnique({
                where: { id: friendId },
                select: { friends: true },
              })
            ).friends.filter((id) => id !== user.id),
          },
        },
      });
      if ((await this.userService.getUserStatus(friend.id)) != 'offline') {
        this.socketService.sendToUser(friendId, user.username, 'friend');
      }
      delete user.hash;
      return user;
    } catch (error) {
      throw new ForbiddenException('Fail to update in database');
    }
  }
}
