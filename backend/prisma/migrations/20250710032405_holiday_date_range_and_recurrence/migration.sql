-- AlterTable
ALTER TABLE "ClosedDay" ADD COLUMN     "fromDate" TIMESTAMP(3),
ADD COLUMN     "recurrence" TEXT,
ADD COLUMN     "toDate" TIMESTAMP(3);
