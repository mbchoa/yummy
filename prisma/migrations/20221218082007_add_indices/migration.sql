/*
  Warnings:

  - The primary key for the `FavoriteRestaurant` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `FavoriteRestaurant` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `RestaurantItemReview` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `favoriteRestaurantId` on the `RestaurantItemReview` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `FavoriteRestaurant` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `RestaurantItem` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `restaurantId` to the `FavoriteRestaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurantId` to the `RestaurantItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `RestaurantItem` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `RestaurantItemReview` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropForeignKey
ALTER TABLE "RestaurantItemReview" DROP CONSTRAINT "RestaurantItemReview_favoriteRestaurantId_fkey";

-- DropForeignKey
ALTER TABLE "RestaurantItemReview" DROP CONSTRAINT "RestaurantItemReview_reviewedById_fkey";

-- AlterTable
ALTER TABLE "FavoriteRestaurant" DROP CONSTRAINT "FavoriteRestaurant_pkey",
ADD COLUMN     "restaurantId" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "FavoriteRestaurant_pkey" PRIMARY KEY ("restaurantId", "userId");

-- AlterTable
ALTER TABLE "RestaurantItem" ADD COLUMN     "restaurantId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "RestaurantItemReview" DROP CONSTRAINT "RestaurantItemReview_pkey",
DROP COLUMN "favoriteRestaurantId",
ADD COLUMN     "id" TEXT NOT NULL,
ALTER COLUMN "reviewedById" DROP NOT NULL,
ADD CONSTRAINT "RestaurantItemReview_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "FavoriteRestaurant_id_key" ON "FavoriteRestaurant"("id");

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantItem_name_key" ON "RestaurantItem"("name");

-- AddForeignKey
ALTER TABLE "RestaurantItem" ADD CONSTRAINT "RestaurantItem_restaurantId_userId_fkey" FOREIGN KEY ("restaurantId", "userId") REFERENCES "FavoriteRestaurant"("restaurantId", "userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantItemReview" ADD CONSTRAINT "RestaurantItemReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
