-- DropIndex
DROP INDEX "RestaurantItem_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "RestaurantItem_name_restaurantId_userId_key" ON "RestaurantItem"("name", "restaurantId", "userId");

