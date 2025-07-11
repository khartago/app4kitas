/*
  Warnings:

  - You are about to drop the column `fromDate` on the `ClosedDay` table. All the data in the column will be lost.
  - You are about to drop the column `recurrence` on the `ClosedDay` table. All the data in the column will be lost.
  - You are about to drop the column `toDate` on the `ClosedDay` table. All the data in the column will be lost.
  - You are about to drop the `Note` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_childId_fkey";

-- DropForeignKey
ALTER TABLE "Note" DROP CONSTRAINT "Note_educatorId_fkey";

-- AlterTable
ALTER TABLE "ClosedDay" DROP COLUMN "fromDate",
DROP COLUMN "recurrence",
DROP COLUMN "toDate";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT;

-- DropTable
DROP TABLE "Note";
