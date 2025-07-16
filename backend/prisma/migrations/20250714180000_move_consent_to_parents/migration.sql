-- Move consent fields from Child to User model
-- Add consent fields to User table
ALTER TABLE "User" ADD COLUMN "consentGiven" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "consentDate" TIMESTAMP(3);

-- Remove consent fields from Child table
ALTER TABLE "Child" DROP COLUMN "consentGiven";
ALTER TABLE "Child" DROP COLUMN "consentDate"; 