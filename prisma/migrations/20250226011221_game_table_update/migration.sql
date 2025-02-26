/*
  Warnings:

  - You are about to drop the column `gameStarted` on the `Game` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Game" DROP COLUMN "gameStarted",
ADD COLUMN     "isGameStarted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "playersReadyCount" INTEGER NOT NULL DEFAULT 0;
