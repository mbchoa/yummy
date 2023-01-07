-- CreateEnum
CREATE TYPE "CollaboratorViewRole" AS ENUM ('OWNER', 'COLLABORATOR');

-- AlterTable
ALTER TABLE "Collaborator" ADD COLUMN     "currentView" "CollaboratorViewRole" NOT NULL DEFAULT 'OWNER';
