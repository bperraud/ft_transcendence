import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Message, MessagePreview } from '../chat/model/chat.model';
import { Access } from '@prisma/client';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async lastConversationMessages(userId: number) {
    const messages = await this.prisma.$queryRaw<
      MessagePreview[]
    >`SELECT m.content,
	m."createdAt",
	m."senderId",
	m."chatId",
	chat.name as "chatName",
	relation."userId" as "friendId",
	friend.username as "friendName",
	u.username as "senderName"
	FROM "public"."Message" as m
	JOIN "public"."User" as u ON m."senderId" = u."id"
	JOIN "public"."UserChatRelationship" as relation ON relation."chatId" = m."chatId"
	JOIN "public"."User" as friend ON relation."userId" = friend."id"
	JOIN "public"."Chat" as chat ON m."chatId" = chat."id"
	WHERE chat.accessibility = 'PRIVATE'::"Access"
	AND (m."createdAt", m."chatId") IN (
		SELECT MAX("createdAt"), "chatId"
		FROM "public"."Message"
		WHERE "chatId" IN (
			SELECT "chatId"
			FROM "public"."UserChatRelationship"
			WHERE "userId" = ${userId}
		)
		GROUP BY "chatId"
	)
	AND relation."userId" != ${userId}
	`;
    return messages;
  }

  async getConversation(chatId: number) {
    const messages = await this.prisma.$queryRaw<
      Message[]
    >`SELECT content, m."createdAt" as "createdAt", "senderId", "username" as "senderName"
	FROM "public"."Message" as m
	JOIN "public"."User" ON "senderId" = "User"."id"
	WHERE "chatId" = ${chatId}
	ORDER BY m."createdAt"`;
    return messages;
  }

  async createChat(
    membersId: number[],
    accessibility?: string,
    name?: string,
    password?: string,
  ): Promise<number> {
    const newGroupChat = await this.prisma.chat.create({
      data: {
        name: name,
        accessibility: Access[accessibility],
        password: password,
      },
    });

    const participants: number[] = [];
    membersId.forEach(async (userId) => {
      participants.push(userId);
      await this.prisma.userChatRelationship.create({
        data: {
          chat: {
            connect: { id: newGroupChat.id },
          },
          user: {
            connect: { id: userId },
          },
        },
      });
    });

    return newGroupChat.id;
  }

  async getChatId(membersId: string[]): Promise<number[]> {
    const ids = membersId.map((str) => BigInt(str));
    const len = membersId.length;
    const chatId = await this.prisma.$queryRaw<number[]>` SELECT "chatId"
	  FROM "public"."UserChatRelationship"
	  WHERE "userId" = ANY(${ids}::bigint[])
	  GROUP BY "chatId"
	  HAVING COUNT(DISTINCT "userId") = ${len}`;
    return chatId;
  }

  async getChatById(id: number | null) {
    if (id === undefined || id === null) return null;
    const chat = await this.prisma.chat.findUnique({
      where: {
        id: id,
      },
    });
    return chat;
  }

  async addMessageToDatabase(
    chatId: number,
    userId: number,
    content: string,
    username: string,
  ): Promise<Message> {
    try {
      const messageFromPrisma = await this.prisma.message.create({
        data: {
          content: content,
          sender: {
            connect: { id: userId },
          },
          chat: {
            connect: { id: chatId },
          },
        },
      });
      const message: Message = {
        ...messageFromPrisma,
        senderName: username,
      };
      return message;
    } catch (error) {
      console.log(error);
    }
  }

  async leaveGroup(chatId: number, userId: number): Promise<any> {
    const result = await this.prisma.userChatRelationship.deleteMany({
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
            accessibility: Access['PUBLIC'],
          },
          {
            accessibility: Access['PROTECTED'],
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
        OR: [
          { accessibility: Access['PUBLIC'] },
          { accessibility: Access['PROTECTED'] },
        ],
      },
    });

    return { chats, totalChatsCount };
  }

  async addUserToChat(chatId: number, userId: number) {
    const chatUser = await this.prisma.userChatRelationship.create({
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
    const accessibility = isProtected ? Access['PUBLIC'] : Access['PROTECTED'];
    const updateData = { accessibility };
    if (password !== undefined) updateData['password'] = password;

    await this.prisma.chat.update({
      where: { id: chatId },
      data: accessibility,
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
