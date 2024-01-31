/*
  Warnings:

  - You are about to drop the `POTD` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "POTD";

-- CreateTable
CREATE TABLE "Problem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "topics" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Problem_pkey" PRIMARY KEY ("id")
);
