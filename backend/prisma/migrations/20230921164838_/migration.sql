/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the `ChatStatus` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupMessage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `GroupParticipant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `chatId` to the `Message` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatStatus" DROP CONSTRAINT "ChatStatus_chatId_fkey";

-- DropForeignKey
ALTER TABLE "ChatStatus" DROP CONSTRAINT "ChatStatus_userId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMessage" DROP CONSTRAINT "GroupMessage_chatId_fkey";

-- DropForeignKey
ALTER TABLE "GroupMessage" DROP CONSTRAINT "GroupMessage_userId_fkey";

-- DropForeignKey
ALTER TABLE "GroupParticipant" DROP CONSTRAINT "GroupParticipant_chatId_fkey";

-- DropForeignKey
ALTER TABLE "GroupParticipant" DROP CONSTRAINT "GroupParticipant_userId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_receiverId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "updatedAt";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "receiverId",
ADD COLUMN     "chatId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "ChatStatus";

-- DropTable
DROP TABLE "GroupMessage";

-- DropTable
DROP TABLE "GroupParticipant";

-- CreateTable
CREATE TABLE "UserChatRelationship" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'default',
    "chatId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserChatRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserChatRelationship_userId_chatId_key" ON "UserChatRelationship"("userId", "chatId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChatRelationship" ADD CONSTRAINT "UserChatRelationship_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChatRelationship" ADD CONSTRAINT "UserChatRelationship_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
