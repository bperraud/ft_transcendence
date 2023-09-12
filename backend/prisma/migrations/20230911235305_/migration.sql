/*
  Warnings:

  - You are about to drop the column `message` on the `GroupMessage` table. All the data in the column will be lost.
  - You are about to drop the `ChatRole` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `content` to the `GroupMessage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "ChatRole" DROP CONSTRAINT "ChatRole_chatId_fkey";

-- DropForeignKey
ALTER TABLE "ChatRole" DROP CONSTRAINT "ChatRole_userId_fkey";

-- AlterTable
ALTER TABLE "GroupMessage" DROP COLUMN "message",
ADD COLUMN     "content" TEXT NOT NULL;

-- DropTable
DROP TABLE "ChatRole";

-- CreateTable
CREATE TABLE "GroupParticipant" (
    "chatId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "GroupParticipant_pkey" PRIMARY KEY ("chatId","userId")
);

-- CreateTable
CREATE TABLE "ChatStatus" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'default',
    "chatId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "ChatStatus_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupParticipant" ADD CONSTRAINT "GroupParticipant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatStatus" ADD CONSTRAINT "ChatStatus_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatStatus" ADD CONSTRAINT "ChatStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
