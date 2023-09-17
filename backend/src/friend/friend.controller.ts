import {
  Controller,
  UseGuards,
  ForbiddenException,
  Param,
  NotFoundException,
  Get,
  ParseIntPipe,
  Delete,
} from '@nestjs/common';
import { JwtGuard } from '../auth/guard';
import { GetUser } from '../auth/decorator';
import { UserService } from '../user/user.service';
import { PrismaClient } from '@prisma/client';
import { FriendService } from './friend.service';

@UseGuards(JwtGuard)
@Controller('friend')
export class FriendController {
  constructor(
    private friendService: FriendService,
    private userService: UserService,
    private prisma: PrismaClient,
  ) {}

  @Get('me')
  async getUserFriends(@GetUser() user) {
    const friends = (await this.friendService.getFriends(user.id)) as any;
    friends.forEach((friend) => {
      friend.status = this.userService.getStatus(friend.id);
    });
    return friends;
  }

  @Delete('remove/:id')
  async removeFriend(
    @GetUser('id') id,
    @Param('id', ParseIntPipe) friendId: number,
  ) {
    if (id == friendId)
      throw new ForbiddenException('You cannot remove yourself as a friend');
    const prisma_friend = await this.prisma.user.findUnique({
      where: { id: friendId },
    });
    if (!prisma_friend) throw new NotFoundException('User not found');
    return await this.friendService.removeFriend(id, prisma_friend.id);
  }
}
