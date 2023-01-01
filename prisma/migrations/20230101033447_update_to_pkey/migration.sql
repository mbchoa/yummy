-- DropIndex
DROP INDEX "Collaborator_id_key";

-- AlterTable
ALTER TABLE "Collaborator" ADD CONSTRAINT "Collaborator_pkey" PRIMARY KEY ("id");
