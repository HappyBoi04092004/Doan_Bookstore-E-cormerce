/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `book` MODIFY `price` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `coupon` MODIFY `discount` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `order` ADD COLUMN `idempotencyKey` VARCHAR(191) NULL,
    MODIFY `total` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `orderitem` MODIFY `price` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `payment` MODIFY `amount` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Order_idempotencyKey_key` ON `Order`(`idempotencyKey`);
