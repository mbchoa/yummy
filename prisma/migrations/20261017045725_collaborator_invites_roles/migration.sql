-- CreateEnum
CREATE TYPE "CollaboratorRole" AS ENUM ('VIEWER', 'EDITOR');

-- CreateEnum
CREATE TYPE "CollaboratorStatus" AS ENUM ('PENDING', 'ACCEPTED');

-- AlterTable
-- existing collaborators keep their access as accepted editors; only new
-- invites start out pending
ALTER TABLE "Collaborator" ADD COLUMN     "role" "CollaboratorRole" NOT NULL DEFAULT 'EDITOR',
ADD COLUMN     "status" "CollaboratorStatus" NOT NULL DEFAULT 'ACCEPTED';

ALTER TABLE "Collaborator" ALTER COLUMN "status" SET DEFAULT 'PENDING';
