-- CreateTable
CREATE TABLE `pengguna` (
    `id_pengguna` INTEGER NOT NULL AUTO_INCREMENT,
    `nik` VARCHAR(16) NULL,
    `nama_lengkap` VARCHAR(255) NOT NULL,
    `username` VARCHAR(100) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NULL,
    `nomor_telepon` VARCHAR(20) NULL,
    `role` ENUM('masyarakat', 'admin', 'petugas') NOT NULL,
    `alamat` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pengguna_nik_key`(`nik`),
    UNIQUE INDEX `pengguna_username_key`(`username`),
    UNIQUE INDEX `pengguna_email_key`(`email`),
    PRIMARY KEY (`id_pengguna`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `aduan` (
    `id_aduan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_pelapor` INTEGER NOT NULL,
    `id_petugas` INTEGER NULL,
    `judul_aduan` VARCHAR(255) NOT NULL,
    `deskripsi_aduan` VARCHAR(191) NOT NULL,
    `kategori_aduan` ENUM('infrastruktur', 'lingkungan', 'sosial', 'keamanan', 'pelayanan_publik', 'lainnya') NULL,
    `tanggal_aduan` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `alamat_aduan` VARCHAR(191) NOT NULL,
    `status_terkini` ENUM('Diajukan', 'Diverifikasi', 'Diproses', 'Ditindaklanjuti', 'Selesai', 'Ditolak') NOT NULL DEFAULT 'Diajukan',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_aduan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `status_aduan` (
    `id_status_aduan` INTEGER NOT NULL AUTO_INCREMENT,
    `id_aduan` INTEGER NOT NULL,
    `status` ENUM('Diajukan', 'Diverifikasi', 'Diproses', 'Ditindaklanjuti', 'Selesai', 'Ditolak') NOT NULL,
    `keterangan` VARCHAR(191) NULL,
    `tanggal_status` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_status_aduan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `lampiran` (
    `id_lampiran` INTEGER NOT NULL AUTO_INCREMENT,
    `id_aduan` INTEGER NULL,
    `id_status_aduan` INTEGER NULL,
    `file_path` VARCHAR(255) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id_lampiran`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `aduan` ADD CONSTRAINT `aduan_id_pelapor_fkey` FOREIGN KEY (`id_pelapor`) REFERENCES `pengguna`(`id_pengguna`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `aduan` ADD CONSTRAINT `aduan_id_petugas_fkey` FOREIGN KEY (`id_petugas`) REFERENCES `pengguna`(`id_pengguna`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `status_aduan` ADD CONSTRAINT `status_aduan_id_aduan_fkey` FOREIGN KEY (`id_aduan`) REFERENCES `aduan`(`id_aduan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lampiran` ADD CONSTRAINT `lampiran_id_aduan_fkey` FOREIGN KEY (`id_aduan`) REFERENCES `aduan`(`id_aduan`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `lampiran` ADD CONSTRAINT `lampiran_id_status_aduan_fkey` FOREIGN KEY (`id_status_aduan`) REFERENCES `status_aduan`(`id_status_aduan`) ON DELETE SET NULL ON UPDATE CASCADE;
