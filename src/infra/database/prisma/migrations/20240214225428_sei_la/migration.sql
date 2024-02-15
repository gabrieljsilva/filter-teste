/*
  Warnings:

  - You are about to drop the column `categoryId` on the `photos` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `photos` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `photos` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `photos` table. All the data in the column will be lost.
  - Added the required column `uploadId` to the `photos` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "photos" DROP CONSTRAINT "photos_categoryId_fkey";

-- AlterTable
ALTER TABLE "photos" DROP COLUMN "categoryId",
DROP COLUMN "created_at",
DROP COLUMN "deleted_at",
DROP COLUMN "url",
ADD COLUMN     "uploadId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "uploads" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "uploads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToPhoto" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_CategoryToPhoto_AB_unique" ON "_CategoryToPhoto"("A", "B");

-- CreateIndex
CREATE INDEX "_CategoryToPhoto_B_index" ON "_CategoryToPhoto"("B");

-- AddForeignKey
ALTER TABLE "photos" ADD CONSTRAINT "photos_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "uploads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPhoto" ADD CONSTRAINT "_CategoryToPhoto_A_fkey" FOREIGN KEY ("A") REFERENCES "category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToPhoto" ADD CONSTRAINT "_CategoryToPhoto_B_fkey" FOREIGN KEY ("B") REFERENCES "photos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
