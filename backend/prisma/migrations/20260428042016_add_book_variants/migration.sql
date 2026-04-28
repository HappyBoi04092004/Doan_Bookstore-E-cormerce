/*
  Warnings:

  - You are about to drop the column `bookId` on the `cartitem` table. All the data in the column will be lost.
  - You are about to drop the column `bookId` on the `orderitem` table. All the data in the column will be lost.
  - You are about to drop the column `bookId` on the `wishlist` table. All the data in the column will be lost.
  - Added the required column `variantId` to the `CartItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variantId` to the `Wishlist` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cartitem` DROP FOREIGN KEY `CartItem_bookId_fkey`;

-- DropForeignKey
ALTER TABLE `orderitem` DROP FOREIGN KEY `OrderItem_bookId_fkey`;

-- DropForeignKey
ALTER TABLE `wishlist` DROP FOREIGN KEY `Wishlist_bookId_fkey`;

-- AlterTable
ALTER TABLE `bookimage` ADD COLUMN `variantId` INTEGER NULL,
    MODIFY `isPrimary` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `cartitem` DROP COLUMN `bookId`,
    ADD COLUMN `variantId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `orderitem` DROP COLUMN `bookId`,
    ADD COLUMN `variantId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `wishlist` DROP COLUMN `bookId`,
    ADD COLUMN `variantId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `BookVariant` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookId` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NULL,
    `price` INTEGER NOT NULL,
    `stock` INTEGER NOT NULL,

    UNIQUE INDEX `BookVariant_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `BookImage_variantId_idx` ON `BookImage`(`variantId`);

-- AddForeignKey
ALTER TABLE `BookVariant` ADD CONSTRAINT `BookVariant_bookId_fkey` FOREIGN KEY (`bookId`) REFERENCES `Book`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartItem` ADD CONSTRAINT `CartItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `BookVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `BookVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Wishlist` ADD CONSTRAINT `Wishlist_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `BookVariant`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookImage` ADD CONSTRAINT `BookImage_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `BookVariant`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
