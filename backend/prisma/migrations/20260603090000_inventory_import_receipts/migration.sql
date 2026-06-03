ALTER TABLE `Book` ADD COLUMN `importPrice` INTEGER NOT NULL DEFAULT 0;

CREATE TABLE `Supplier` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NULL,
  `phone` VARCHAR(191) NULL,
  `address` VARCHAR(191) NULL,
  `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `Supplier_name_idx`(`name`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ImportReceipt` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `code` VARCHAR(191) NOT NULL,
  `supplierId` INTEGER NOT NULL,
  `totalAmount` INTEGER NOT NULL,
  `note` VARCHAR(191) NULL,
  `createdBy` INTEGER NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `ImportReceipt_code_key`(`code`),
  INDEX `ImportReceipt_supplierId_idx`(`supplierId`),
  INDEX `ImportReceipt_createdBy_idx`(`createdBy`),
  INDEX `ImportReceipt_createdAt_idx`(`createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ImportReceiptDetail` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `importReceiptId` INTEGER NOT NULL,
  `productId` INTEGER NOT NULL,
  `quantity` INTEGER NOT NULL,
  `importPrice` INTEGER NOT NULL,
  `subtotal` INTEGER NOT NULL,
  INDEX `ImportReceiptDetail_importReceiptId_idx`(`importReceiptId`),
  INDEX `ImportReceiptDetail_productId_idx`(`productId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `ImportReceipt` ADD CONSTRAINT `ImportReceipt_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `ImportReceipt` ADD CONSTRAINT `ImportReceipt_createdBy_fkey` FOREIGN KEY (`createdBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `ImportReceiptDetail` ADD CONSTRAINT `ImportReceiptDetail_importReceiptId_fkey` FOREIGN KEY (`importReceiptId`) REFERENCES `ImportReceipt`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ImportReceiptDetail` ADD CONSTRAINT `ImportReceiptDetail_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Book`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
