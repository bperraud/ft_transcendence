import { Module, forwardRef } from '@nestjs/common';
import { FriendController } from './friend.controller';
import { FriendService } from './friend.service';
import { UserService } from 'src/user/user.service';
import { PrismaClient } from '@prisma/client';
import { WebSocketModule } from '../websocket/websocket.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, forwardRef(() => WebSocketModule)],

  controllers: [FriendController],
  providers: [FriendService, UserService, PrismaClient],
})
export class FriendModule {}
