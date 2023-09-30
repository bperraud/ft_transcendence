/*
  Warnings:

  - The `accessibility` column on the `Chat` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `ladder` column on the `Stat` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `status` on the `UserChatRelationship` table. All the data in the column will be lost.
  - Changed the type of `type` on the `Notification` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `Relationship` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Relation" AS ENUM ('FRIEND');

-- CreateEnum
CREATE TYPE "Notif" AS ENUM ('GAME', 'FRIEND');

-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND');

-- CreateEnum
CREATE TYPE "Access" AS ENUM ('PUBLIC', 'PRIVATE', 'PROTECTED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'BAN', 'MUTE');

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "accessibility",
ADD COLUMN     "accessibility" "Access" NOT NULL DEFAULT 'PUBLIC';

-- AlterTable
ALTER TABLE "Notification" DROP COLUMN "type",
ADD COLUMN     "type" "Notif" NOT NULL;

-- AlterTable
ALTER TABLE "Relationship" DROP COLUMN "type",
ADD COLUMN     "type" "Relation" NOT NULL;

-- AlterTable
ALTER TABLE "Stat" DROP COLUMN "ladder",
ADD COLUMN     "ladder" "Rank" NOT NULL DEFAULT 'BRONZE';

-- AlterTable
ALTER TABLE "UserChatRelationship" DROP COLUMN "status",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE UNIQUE INDEX "Notification_userId_senderId_type_key" ON "Notification"("userId", "senderId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "Relationship_user1Id_user2Id_type_key" ON "Relationship"("user1Id", "user2Id", "type");
