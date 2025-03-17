/*
  Warnings:

  - A unique constraint covering the columns `[gameBoardId,row,col]` on the table `Coordinate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[gameBoardId,shipType]` on the table `Ship` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Coordinate_gameBoardId_row_col_key" ON "Coordinate"("gameBoardId", "row", "col");

-- CreateIndex
CREATE UNIQUE INDEX "Ship_gameBoardId_shipType_key" ON "Ship"("gameBoardId", "shipType");
