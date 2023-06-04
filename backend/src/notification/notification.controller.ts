import { Controller, Post, UseGuards, Body, Get } from '@nestjs/common';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { ForbiddenException } from '@nestjs/common';
import { FriendDto } from 'src/user/dto';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notification.service';
import { NotificationDto, ResponseDto } from './dto';
import { UserService } from 'src/user/user.service';

@UseGuards(JwtGuard)
@Controller('notification')
export class NotificationController {
  constructor(
    private prisma: PrismaClient,
    private notifService: NotificationService,
    private userService: UserService,
  ) {}

  @Post('add-friend')
  async addFriend(@GetUser('username') username, @Body() dto: FriendDto) {
    console.log(username);
    if (username == dto.friend)
      throw new ForbiddenException('You cannot add yourself as a friend');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: dto.friend },
    });
    if (!prisma_friend) throw new ForbiddenException('User not found');
    return await this.notifService.notifyEvent(
      prisma_friend.username,
      username,
      'friend',
    );
  }

  @Post('friend-response')
  async responseFriend(
    @GetUser('username') username,
    @Body() dto: ResponseDto,
  ) {
    console.log('friend-response');
    this.notifService.removeNotification(username, dto.friend, 'friend');

    if (dto.response) {
      if (username == dto.friend)
        throw new ForbiddenException('You cannot add yourself as a friend');
      const prisma_friend = await this.prisma.user.findUnique({
        where: { username: dto.friend },
      });
      if (!prisma_friend) throw new ForbiddenException('User not found');
      return await this.userService.addFriend(username, prisma_friend.id);
    }
  }

  @Post('ask-game')
  async match(@GetUser('username') username, @Body() dto: FriendDto) {
    if (username == dto.friend)
      throw new ForbiddenException('You cannot match yourself');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { username: dto.friend },
    });
    if (!prisma_friend) throw new ForbiddenException('User not found');
    return await this.notifService.notifyEvent(
      prisma_friend.username,
      username,
      'game',
    );
  }

  @Get('notification')
  async getNotifFriend(@GetUser('id') id, @Body() dto: NotificationDto) {
    const prisma_user = await this.prisma.user.findUnique({
      where: { id: id },
      include: { notifications: true },
    });
    if (!prisma_user) throw new ForbiddenException('User not found');
    const notif = prisma_user.notifications;
    return notif.filter((notif) => notif.type == dto.notification);
  }
}
