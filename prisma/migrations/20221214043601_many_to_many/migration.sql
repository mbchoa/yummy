/*
  Warnings:

  - You are about to drop the `FoodReview` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FoodReview" DROP CONSTRAINT "FoodReview_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "FoodReview" DROP CONSTRAINT "FoodReview_userId_fkey";

-- DropTable
DROP TABLE "FoodReview";

-- CreateTable
CREATE TABLE "RestaurantItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RestaurantItemReview" (
    "favoriteRestaurantId" TEXT NOT NULL,
    "restaurantItemId" TEXT NOT NULL,
    "reviewedById" TEXT NOT NULL,
    "like" "Like" NOT NULL DEFAULT 'UNSELECTED',
    "review" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestaurantItemReview_pkey" PRIMARY KEY ("favoriteRestaurantId","restaurantItemId","reviewedById")
);

-- AddForeignKey
ALTER TABLE "RestaurantItemReview" ADD CONSTRAINT "RestaurantItemReview_favoriteRestaurantId_fkey" FOREIGN KEY ("favoriteRestaurantId") REFERENCES "FavoriteRestaurant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantItemReview" ADD CONSTRAINT "RestaurantItemReview_restaurantItemId_fkey" FOREIGN KEY ("restaurantItemId") REFERENCES "RestaurantItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RestaurantItemReview" ADD CONSTRAINT "RestaurantItemReview_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
