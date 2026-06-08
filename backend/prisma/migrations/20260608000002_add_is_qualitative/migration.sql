-- AlterTable
ALTER TABLE "TestParameter" ADD COLUMN "isQualitative" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "TestParameter" ADD COLUMN "titerValues" TEXT;
