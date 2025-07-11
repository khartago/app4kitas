/*
  Warnings:

  - You are about to drop the column `completedAt` on the `PersonalTask` table. All the data in the column will be lost.
  - You are about to drop the column `priority` on the `PersonalTask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PersonalTask" DROP COLUMN "completedAt",
DROP COLUMN "priority",
ADD COLUMN     "dueDate" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ChatReadStatus" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "channelId" TEXT,
    "directMessageId" TEXT,
    "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatReadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "educatorId" TEXT NOT NULL,
    "attachmentUrl" TEXT,
    "attachmentName" TEXT,
    "attachmentType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatReadStatus_userId_channelId_key" ON "ChatReadStatus"("userId", "channelId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatReadStatus_userId_directMessageId_key" ON "ChatReadStatus"("userId", "directMessageId");

-- AddForeignKey
ALTER TABLE "ChatReadStatus" ADD CONSTRAINT "ChatReadStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReadStatus" ADD CONSTRAINT "ChatReadStatus_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "ChatChannel"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatReadStatus" ADD CONSTRAINT "ChatReadStatus_directMessageId_fkey" FOREIGN KEY ("directMessageId") REFERENCES "DirectMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_educatorId_fkey" FOREIGN KEY ("educatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
