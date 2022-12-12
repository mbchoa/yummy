/*
  Warnings:

  - The `like` column on the `FoodReview` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Like" AS ENUM ('LIKE', 'DISLIKE', 'UNSELECTED');

-- AlterTable
ALTER TABLE "FoodReview" DROP COLUMN "like",
ADD COLUMN     "like" "Like" NOT NULL DEFAULT 'UNSELECTED',
ALTER COLUMN "review" DROP NOT NULL;
