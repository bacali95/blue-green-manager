/*
  Warnings:

  - Added the required column `updatedAt` to the `CommandExecutionLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "CommandStatus" ADD VALUE 'SENT';

-- AlterTable
ALTER TABLE "CommandExecutionLog" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'QUEUED',
ALTER COLUMN "executedAt" DROP NOT NULL,
ALTER COLUMN "executedAt" DROP DEFAULT;
