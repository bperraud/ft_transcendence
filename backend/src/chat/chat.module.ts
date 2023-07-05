import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { AuthService } from '../auth/auth.service';
import { UserService } from '../user/user.service';
import { ChatService } from '../chat/chat.service';
import { WebSocketModule } from '../websocket/websocket.module';
import { StatModule } from 'src/stat/stat.module';
import { StatService } from 'src/stat/stat.service';
import { PrismaClient } from '@prisma/client';
import { NotificationService } from 'src/notification/notification.service';
import { PongService } from 'src/pong/pong.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [JwtModule.register({}), HttpModule, WebSocketModule, StatModule],
  controllers: [ChatController],
  providers: [
    ChatGateway,
    AuthService,
    UserService,
    ChatService,
    PrismaClient,
    StatService,
    PongService,
    NotificationService,
    ChatService,
  ],
  exports: [ChatService],
})
export class ChatModule {}
