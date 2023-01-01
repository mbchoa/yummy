/*
  Warnings:

  - A unique constraint covering the columns `[collaboratorId,ownerId]` on the table `Collaborator` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Collaborator_collaboratorId_ownerId_key" ON "Collaborator"("collaboratorId", "ownerId");
