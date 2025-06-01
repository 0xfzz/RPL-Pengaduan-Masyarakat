-- DropForeignKey
ALTER TABLE `aduan` DROP FOREIGN KEY `aduan_id_pelapor_fkey`;

-- DropForeignKey
ALTER TABLE `aduan` DROP FOREIGN KEY `aduan_id_petugas_fkey`;

-- DropForeignKey
ALTER TABLE `lampiran` DROP FOREIGN KEY `lampiran_id_aduan_fkey`;

-- DropForeignKey
ALTER TABLE `lampiran` DROP FOREIGN KEY `lampiran_id_status_aduan_fkey`;

-- DropForeignKey
ALTER TABLE `status_aduan` DROP FOREIGN KEY `status_aduan_id_aduan_fkey`;

-- DropIndex
DROP INDEX `aduan_id_pelapor_fkey` ON `aduan`;

-- DropIndex
DROP INDEX `aduan_id_petugas_fkey` ON `aduan`;

-- DropIndex
DROP INDEX `lampiran_id_aduan_fkey` ON `lampiran`;

-- DropIndex
DROP INDEX `lampiran_id_status_aduan_fkey` ON `lampiran`;

-- DropIndex
DROP INDEX `status_aduan_id_aduan_fkey` ON `status_aduan`;

-- AddForeignKey
ALTER TABLE `aduan` ADD CONSTRAINT `aduan_id_pelapor_fkey` FOREIGN KEY (`id_pelapor`) REFERENCES `pengguna`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aduan` ADD CONSTRAINT `aduan_id_petugas_fkey` FOREIGN KEY (`id_petugas`) REFERENCES `pengguna`(`id_pengguna`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status_aduan` ADD CONSTRAINT `status_aduan_id_aduan_fkey` FOREIGN KEY (`id_aduan`) REFERENCES `aduan`(`id_aduan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lampiran` ADD CONSTRAINT `lampiran_id_aduan_fkey` FOREIGN KEY (`id_aduan`) REFERENCES `aduan`(`id_aduan`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lampiran` ADD CONSTRAINT `lampiran_id_status_aduan_fkey` FOREIGN KEY (`id_status_aduan`) REFERENCES `status_aduan`(`id_status_aduan`) ON DELETE CASCADE ON UPDATE CASCADE;
