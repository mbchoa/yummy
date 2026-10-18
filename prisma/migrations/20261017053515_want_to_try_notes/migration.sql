-- AlterEnum
ALTER TYPE "Like" ADD VALUE 'WANT_TO_TRY';

-- AlterTable
ALTER TABLE "FavoriteRestaurant" ADD COLUMN     "note" TEXT,
ADD COLUMN     "removedAt" TIMESTAMP(3);
