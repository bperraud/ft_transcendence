import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Chat, GroupMessage, Message } from '../chat/model/chat.model';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getAllUserChats(username: string) {
    // async getAllUserChats(username: string): Promise<Chat[]> {
    //const chats = await this.prisma.chat.findMany({
    //  where: {
    //    chatUsers: {
    //      some: {
    //        user: {
    //          username: username,
    //        },
    //      },
    //    },
    //  },
    //  include: {
    //    messages: {
    //      include: {
    //        user: true,
    //      },
    //    },
    //    chatUsers: {
    //      include: {
    //        user: true,
    //      },
    //    },
    //  },
    //});
    //return chats;
  }

  async createChat(
    groupName: string,
    memberUsernames: string[],
    accessibility: string,
    password?: string,
  ): Promise<{ groupId: number; participants: number[] }> {
    const newGroupChat = await this.prisma.chat.create({
      data: {
        name: groupName,
        accessibility: accessibility,
        password: password,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    });

    let user;

    let participants: number[];
    const groupId = newGroupChat.id;
    memberUsernames.forEach(async (userName) => {
      user = await this.prisma.user.findUnique({
        where: {
          username: userName,
        },
      });
      if (user) {
        participants.push(user.id);
        await this.prisma.groupParticipant.create({
          data: {
            chat: {
              connect: { id: newGroupChat.id },
            },
            user: {
              connect: { id: user.id },
            },
          },
        });
        await this.prisma.groupParticipant.create({
          data: {
            chat: {
              connect: { id: newGroupChat.id },
            },
            user: {
              connect: { id: user.id },
            },
          },
        });
      }
    });

    return { groupId, participants };
  }

  async findChatById(id: number | null) {
    if (id === undefined || id === null) return null;
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: id,
      },
    });
    return chat;
  }

  async addMessageToDatabase(
    content: string,
    userId: number,
    friendId: number,
  ): Promise<Message> {
    const newMessage = await this.prisma.message.create({
      data: {
        content: content,
        sender: {
          connect: { id: userId },
        },
        receiver: {
          connect: { id: friendId },
        },
        createdAt: new Date(),
      },
    });
    return newMessage;
  }

  // addNewMessage
  async addGroupMessageToDatabase(
    chatId: number,
    content: string,
    userId: number,
  ): Promise<GroupMessage> {
    const newMessage = await this.prisma.groupMessage.create({
      data: {
        content: content,
        chat: {
          connect: { id: chatId },
        },
        user: {
          connect: { id: userId },
        },
        createdAt: new Date(),
      },
      include: {
        user: true,
      },
    });
    return newMessage;
  }

  async leaveGroup(chatId: number, userId: number): Promise<any> {
    const result = await this.prisma.groupParticipant.deleteMany({
      where: {
        chatId: chatId,
        userId: userId,
      },
    });
    return result;
  }

  async changeChatName(chatId: number, newName: string): Promise<any> {
    const result = await this.prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        name: newName,
      },
    });
    return result;
  }

  async getChatsPublic(start: number, limit: number): Promise<any> {
    const chats = await this.prisma.chat.findMany({
      where: {
        OR: [
          {
            accessibility: 'public',
          },
          {
            accessibility: 'protected',
          },
        ],
      },
      select: {
        id: true,
        accessibility: true,
        password: true,
        name: true,
      },
      skip: start,
      take: limit,
    });

    const totalChatsCount = await this.prisma.chat.count({
      where: {
        OR: [{ accessibility: 'public' }, { accessibility: 'protected' }],
      },
    });

    return { chats, totalChatsCount };
  }

  async addUserToChat(chatId: number, userId: number) {
    const chatUser = await this.prisma.groupParticipant.create({
      data: {
        chat: {
          connect: { id: chatId },
        },
        user: {
          connect: { id: userId },
        },
      },
    });
    return chatUser;
  }

  async setAccess(
    chatId: number,
    isProtected: boolean,
    password?: string,
  ): Promise<void> {
    const accessibility = isProtected ? 'public' : 'protected';
    const updateData = { accessibility };
    if (password !== undefined) updateData['password'] = password;

    await this.prisma.chat.update({
      where: { id: chatId },
      data: updateData,
    });
  }

  async setPassword(chatId: number, password: string): Promise<void> {
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { password },
    });
  }

  async changeRole(chatId: number, userId: number, newRole: string) {
    //if (newRole == 'admin') {
    //  const updatedChatUser = await this.prisma.ChatStatus.create({
    //    data: {
    //      status: 'admin',
    //      chatId,
    //      userId,
    //    },
    //  });
    //}
    //else {
    //}
    //return updatedChatUser;
  }

  //BAN//

  async banUser(chatId: number, userId: number, duration: number | null) {
    //    const expiresAt = duration ? new Date(Date.now() + duration * 1000) : null;
    //    const existingBan = await this.prisma.ban.findUnique({
    //      where: { chatId_userId: { chatId: chatId, userId: userId } },
    //    });
    //    if (existingBan) {
    //      await this.prisma.ban.update({
    //        where: { chatId_userId: { chatId: chatId, userId: userId } },
    //        data: { expiresAt: expiresAt },
    //      });
    //    } else {
    //      await this.prisma.ban.create({
    //        data: {
    //          chatId,
    //          userId,
    //          expiresAt,
    //        },
    //      });
    //    }
    //    return expiresAt;
    //  }
    //  async unBanUser(chatId: number, userId: number) {
    //    await this.prisma.ChatStatus.delete({
    //      where: {
    //        chatId: chatId,
    //        userId: userId,
    //      },
    //    });
  }

  //MUTE//

  async muteUser(chatId: number, userId: number, duration: number | null) {
    //const expiresAt = duration ? new Date(Date.now() + duration * 1000) : null;
    //const existingMute = await this.prisma.ChatStatus.findUnique({
    //  where: {
    //    chatId: chatId,
    //    userId: userId,
    //  },
    //});
    //if (existingMute) {
    //  if (existingMute.status == 'admin' || existingMute.status == 'ban') {
    //    return;
    //  }
    //  await this.prisma.ChatStatus.update({
    //    where: { chatId_userId: { chatId: chatId, userId: userId } },
    //    data: { expiresAt: expiresAt },
    //  });
    //} else {
    //  await this.prisma.ChatStatus.create({
    //    data: {
    //      status: 'mute',
    //      chatId,
    //      userId,
    //      expiresAt,
    //    },
    //  });
    //}
    //return expiresAt;
  }

  async unMuteUser(chatId: number, userId: number) {
    //await this.prisma.ChatStatus.delete({
    //  where: {
    //    chatId: chatId,
    //    userId: userId,
    //  },
    //});
  }

  async unBanUser(chatId: number, userId: number) {
    //await this.prisma.ChatStatus.delete({
    //  where: {
    //    chatId: chatId,
    //    userId: userId,
    //  },
    //});
  }

  async updateLastMessageRead(
    chatId: number,
    messageId: number,
    userId: number,
  ): Promise<any> {
    //return await this.prisma.chatUser.update({
    //  where: {
    //    userId_chatId: { userId, chatId },
    //  },
    //  data: {
    //    lastReadMessageId: messageId,
    //  },
    //});
  }
}
