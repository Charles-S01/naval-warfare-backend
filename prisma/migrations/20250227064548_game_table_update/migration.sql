/*
  Warnings:

  - You are about to drop the column `isFullGame` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `isGameStarted` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "isFullGame",
DROP COLUMN "isGameStarted";
