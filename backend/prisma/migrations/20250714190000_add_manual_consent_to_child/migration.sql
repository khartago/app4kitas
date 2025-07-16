-- Add manual consent fields to Child model for paper-based consent
ALTER TABLE "Child" ADD COLUMN "manualConsentGiven" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Child" ADD COLUMN "manualConsentDate" TIMESTAMP(3);
ALTER TABLE "Child" ADD COLUMN "manualConsentSetBy" TEXT; 