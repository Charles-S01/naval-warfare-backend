/*
  Warnings:

  - You are about to drop the column `shipId` on the `Coordinate` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Coordinate` table. All the data in the column will be lost.
  - Added the required column `length` to the `Ship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shipType` to the `Ship` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ShipType" AS ENUM ('CARRIER', 'SUBMARINE', 'DESTROYER');

-- DropForeignKey
ALTER TABLE "Coordinate" DROP CONSTRAINT "Coordinate_shipId_fkey";

-- AlterTable
ALTER TABLE "Coordinate" DROP COLUMN "shipId",
DROP COLUMN "type",
ADD COLUMN     "isHit" BOOLEAN,
ADD COLUMN     "shipType" "ShipType";

-- AlterTable
ALTER TABLE "Ship" ADD COLUMN     "length" INTEGER NOT NULL,
ADD COLUMN     "shipType" "ShipType" NOT NULL;

-- DropEnum
DROP TYPE "CoordType";
