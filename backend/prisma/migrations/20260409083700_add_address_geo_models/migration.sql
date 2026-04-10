-- Migration: add Province, District, Ward models and update Address
-- Safely clear existing Address rows before restructuring the table

DELETE FROM `Address`;

-- CreateTable Province
CREATE TABLE `Province` (
    `code` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,

    INDEX `Province_name_idx`(`name`),
    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable District
CREATE TABLE `District` (
    `code` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `provinceCode` INTEGER NOT NULL,

    INDEX `District_name_idx`(`name`),
    INDEX `District_provinceCode_idx`(`provinceCode`),
    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable Ward
CREATE TABLE `Ward` (
    `code` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `districtCode` INTEGER NOT NULL,

    INDEX `Ward_name_idx`(`name`),
    INDEX `Ward_districtCode_idx`(`districtCode`),
    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable Address: drop old columns, add new ones
ALTER TABLE `Address`
    DROP COLUMN `city`,
    DROP COLUMN `street`,
    DROP COLUMN `zipCode`,
    ADD COLUMN `name`         VARCHAR(191) NOT NULL,
    ADD COLUMN `phone`        VARCHAR(191) NOT NULL,
    ADD COLUMN `provinceCode` INTEGER NOT NULL,
    ADD COLUMN `districtCode` INTEGER NOT NULL,
    ADD COLUMN `wardCode`     INTEGER NOT NULL,
    ADD COLUMN `detail`       VARCHAR(191) NOT NULL;

-- AddForeignKey District → Province
ALTER TABLE `District` ADD CONSTRAINT `District_provinceCode_fkey`
    FOREIGN KEY (`provinceCode`) REFERENCES `Province`(`code`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey Ward → District
ALTER TABLE `Ward` ADD CONSTRAINT `Ward_districtCode_fkey`
    FOREIGN KEY (`districtCode`) REFERENCES `District`(`code`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey Address → Province
ALTER TABLE `Address` ADD CONSTRAINT `Address_provinceCode_fkey`
    FOREIGN KEY (`provinceCode`) REFERENCES `Province`(`code`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey Address → District
ALTER TABLE `Address` ADD CONSTRAINT `Address_districtCode_fkey`
    FOREIGN KEY (`districtCode`) REFERENCES `District`(`code`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey Address → Ward
ALTER TABLE `Address` ADD CONSTRAINT `Address_wardCode_fkey`
    FOREIGN KEY (`wardCode`) REFERENCES `Ward`(`code`)
    ON DELETE RESTRICT ON UPDATE CASCADE;
