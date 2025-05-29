/*
  Warnings:

  - You are about to drop the column `username` on the `pengguna` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `pengguna_username_key` ON `pengguna`;

-- AlterTable
ALTER TABLE `pengguna` DROP COLUMN `username`,
    ADD COLUMN `verified` BOOLEAN NOT NULL DEFAULT false;
