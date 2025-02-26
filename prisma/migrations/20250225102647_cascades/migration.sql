-- DropForeignKey
ALTER TABLE "Coordinate" DROP CONSTRAINT "Coordinate_gameBoardId_fkey";

-- DropForeignKey
ALTER TABLE "Coordinate" DROP CONSTRAINT "Coordinate_shipId_fkey";

-- DropForeignKey
ALTER TABLE "GameBoard" DROP CONSTRAINT "GameBoard_playerId_fkey";

-- DropForeignKey
ALTER TABLE "Player" DROP CONSTRAINT "Player_gameId_fkey";

-- DropForeignKey
ALTER TABLE "Ship" DROP CONSTRAINT "Ship_gameBoardId_fkey";

-- AddForeignKey
ALTER TABLE "Player" ADD CONSTRAINT "Player_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameBoard" ADD CONSTRAINT "GameBoard_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ship" ADD CONSTRAINT "Ship_gameBoardId_fkey" FOREIGN KEY ("gameBoardId") REFERENCES "GameBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coordinate" ADD CONSTRAINT "Coordinate_gameBoardId_fkey" FOREIGN KEY ("gameBoardId") REFERENCES "GameBoard"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coordinate" ADD CONSTRAINT "Coordinate_shipId_fkey" FOREIGN KEY ("shipId") REFERENCES "Ship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
