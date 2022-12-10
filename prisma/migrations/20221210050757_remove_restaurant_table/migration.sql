/*
  Warnings:

  - You are about to drop the `Restaurant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FavoriteRestaurant" DROP CONSTRAINT "FavoriteRestaurant_restaurantId_fkey";

-- DropTable
DROP TABLE "Restaurant";
