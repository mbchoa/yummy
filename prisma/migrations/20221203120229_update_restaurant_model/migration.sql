/*
  Warnings:

  - You are about to drop the column `address` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `Restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `zip` on the `Restaurant` table. All the data in the column will be lost.
  - Added the required column `address1` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address2` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `address3` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `alias` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `distance` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageUrl` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isClosed` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rating` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reviewCount` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `Restaurant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Restaurant" DROP COLUMN "address",
DROP COLUMN "phone",
DROP COLUMN "website",
DROP COLUMN "zip",
ADD COLUMN     "address1" TEXT NOT NULL,
ADD COLUMN     "address2" TEXT NOT NULL,
ADD COLUMN     "address3" TEXT NOT NULL,
ADD COLUMN     "alias" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "distance" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "imageUrl" TEXT NOT NULL,
ADD COLUMN     "isClosed" BOOLEAN NOT NULL,
ADD COLUMN     "price" TEXT NOT NULL,
ADD COLUMN     "rating" INTEGER NOT NULL,
ADD COLUMN     "reviewCount" INTEGER NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
