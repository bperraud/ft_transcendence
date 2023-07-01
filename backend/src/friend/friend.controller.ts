import {
  Controller,
  UseGuards,
  ForbiddenException,
  Body,
  NotFoundException,
  Get,
  Patch,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { FriendDto } from './dto';
import { GetUser } from '../auth/decorator';
import { UserService } from '../user/user.service';
import { PrismaClient } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('friend')
export class FriendController {
  constructor(private userService: UserService, private prisma: PrismaClient) {}

  @Get('me/friends')
  async getUserFriends(@GetUser() user) {
    const friends = (await this.prisma.user.findMany({
      where: { id: { in: user.friends } },
    })) as any;
    friends.forEach((friend) => {
      friend.status = this.userService.getStatus(friend.id);
    });
    return friends;
  }

  @Patch('remove-friend')
  async removeFriend(@GetUser('id') id, @Body() dto: FriendDto) {
    if (id == dto.friendId)
      throw new ForbiddenException('You cannot remove yourself as a friend');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { id: dto.friendId },
    });
    if (!prisma_friend) throw new NotFoundException('User not found');
    return await this.userService.removeFriend(id, prisma_friend.id);
  }
}
