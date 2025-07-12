/*
  Warnings:

  - Added the required column `institutionId` to the `CheckInLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionId` to the `Message` table without a default value. This is not possible if the table is not empty.
  - Added the required column `institutionId` to the `NotificationLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CheckInLog" ADD COLUMN     "institutionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "institutionId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "NotificationLog" ADD COLUMN     "institutionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CheckInLog" ADD CONSTRAINT "CheckInLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotificationLog" ADD CONSTRAINT "NotificationLog_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
