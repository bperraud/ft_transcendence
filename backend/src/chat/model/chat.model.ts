export type Chat = {
  id: number;

  createdAt: Date;
  updatedAt: Date;
  name: string;
  accessibility: string;
  password: string;
};

export type ChatUser = {
  id: number;
  createdAt: Date;
  userId: number;
  chatId: number;
  lastReadMessageId: number | null;
  user: User;
};

export type Message = {
  id: number;
  createdAt: Date;
  chatId: number;
  senderId: number;
  senderName: string;
  content: string;
};

export type MessagePreview = {
  id: number;
  createdAt: Date;
  chatId: number;
  chatName: string;
//  friendId: number;
//  friendName: string;
  senderId: number;
  senderName: string;
  content: string;
};

export type User = {
  id: number;
  username: string;
};
